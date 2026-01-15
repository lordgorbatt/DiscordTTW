import type { Message, Attachment } from 'discord.js';
import { parseTwmods } from '../../parsers/twmods.js';
import { SteamCache } from '../../steam/cache.js';
import { fetchSteamWorkshopDetails } from '../../steam/api.js';
import { enrichMods, compareModFiles } from '../../domain/compare.js';
import { renderTablePage } from '../../render/table.js';
import { createPaginationSession, createPaginationButtons } from '../ui/pagination.js';
import { generateCSV } from '../../export/csv.js';
import { generateJSON } from '../../export/json.js';
import { AttachmentBuilder } from 'discord.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function handleTwmodsMessage(
  message: Message,
  steamCache: SteamCache,
  allowedChannels?: string[]
): Promise<void> {
  // Check channel restrictions
  if (allowedChannels && allowedChannels.length > 0) {
    if (!allowedChannels.includes(message.channel.id)) {
      return;
    }
  }

  // Find .twmods attachments
  const twmodsAttachments = message.attachments.filter(
    att => att.name?.endsWith('.twmods')
  );

  if (twmodsAttachments.size === 0) {
    return;
  }

  // Check file sizes
  for (const attachment of twmodsAttachments.values()) {
    if (attachment.size > MAX_FILE_SIZE) {
      await message.reply(`❌ File \`${attachment.name}\` is too large (max 5MB)`);
      return;
    }
  }

  // Show processing message
  const processingMsg = await message.reply('📥 Processing `.twmods` files...');

  try {
    // Download and parse all files
    const fileMods: Array<{ name: string; mods: ReturnType<typeof parseTwmods>['mods'] }> = [];
    const fileNames: string[] = [];

    for (const attachment of twmodsAttachments.values()) {
      const content = await downloadAttachment(attachment);
      const parseResult = parseTwmods(content);
      
      if (parseResult.mods.length === 0) {
        await processingMsg.edit(`⚠️ File \`${attachment.name}\` was parsed but no mods were found. Please check the file format.`);
        return;
      }
      
      fileMods.push({ name: attachment.name || 'unknown.twmods', mods: parseResult.mods });
      fileNames.push(attachment.name || 'unknown.twmods');
    }
    
    if (fileMods.length === 0) {
      await processingMsg.edit('❌ No valid mods found in the uploaded files.');
      return;
    }

    // Collect all unique workshop IDs
    const workshopIds = new Set<string>();
    for (const { mods } of fileMods) {
      for (const mod of mods) {
        if (mod.workshop_id) {
          workshopIds.add(mod.workshop_id);
        }
      }
    }

    // Fetch Steam data (with caching)
    const workshopIdsArray = Array.from(workshopIds);
    const cachedData = steamCache.getBatch(workshopIdsArray);
    const uncachedIds = workshopIdsArray.filter(id => !cachedData.has(id));

    let steamData = new Map(cachedData);

    if (uncachedIds.length > 0) {
      const fetchedData = await fetchSteamWorkshopDetails(uncachedIds);
      steamCache.setBatch(fetchedData);
      
      // Merge fetched data
      for (const [id, details] of fetchedData.entries()) {
        const tags = details.tags || [];
        steamData.set(id, {
          workshop_id: id,
          title: details.title || 'Unknown',
          tags_json: JSON.stringify(tags.map(t => t.tag)),
          time_updated: details.time_updated || Math.floor(Date.now() / 1000),
          fetched_at: Math.floor(Date.now() / 1000),
        });
      }
    }

    // Enrich mods
    const enrichedMods = fileMods.map(({ mods }) => enrichMods(mods, steamData));

    // Compare
    const comparison = compareModFiles(
      fileMods.map(f => f.mods),
      enrichedMods
    );

    // Generate summary
    let summary = `📊 **Comparison Summary**
• Files scanned: ${comparison.summary.files_scanned}
• Total unique mods: ${comparison.summary.union_count}`;
    
    if (comparison.summary.files_scanned > 1) {
      summary += `\n• Shared mods: ${comparison.summary.shared_count}
• Unique per file: ${comparison.summary.unique_per_file.map((c, i) => `File ${i + 1}: ${c}`).join(', ')}`;
    }

    // Render first page
    const page = renderTablePage(comparison.rows, fileNames, 1);
    const buttons = createPaginationButtons(page.pageNumber, page.totalPages);

    // Create pagination session
    createPaginationSession(processingMsg.id, message.author.id, comparison.rows, fileNames);

    // Generate exports
    const csvContent = generateCSV(comparison.rows, fileNames);
      const jsonContent = generateJSON(comparison.rows);

    const csvAttachment = new AttachmentBuilder(Buffer.from(csvContent, 'utf-8'), {
      name: 'comparison_table_full.csv',
    });

    const jsonAttachment = new AttachmentBuilder(Buffer.from(jsonContent, 'utf-8'), {
      name: 'comparison_table_full.json',
    });

    // Update message with results
    await processingMsg.edit({
      content: `${summary}\n\n${page.content}`,
      components: [buttons],
      files: [csvAttachment, jsonAttachment],
    });

  } catch (error) {
    console.error('Error processing .twmods files:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    await processingMsg.edit(`❌ Error processing files: ${errorMessage}\n\nPlease check the file format and try again. If the issue persists, check the bot logs.`);
  }
}

async function downloadAttachment(attachment: Attachment): Promise<string> {
  const response = await fetch(attachment.url);
  if (!response.ok) {
    throw new Error(`Failed to download attachment: ${response.statusText}`);
  }
  return await response.text();
}
