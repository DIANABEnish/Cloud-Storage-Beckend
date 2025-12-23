// backend/utils/fileAnalyzer.js

const isOldFile = (lastModified) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(lastModified) < sixMonthsAgo;
};

const findDuplicates = (files) => {
  const hashGroups = {};
  
  files.forEach((file, index) => {
    if (!hashGroups[file.hash]) {
      hashGroups[file.hash] = [];
    }
    hashGroups[file.hash].push({ ...file, fileIndex: index });
  });
  
  const duplicatesToRemove = [];
  
  Object.values(hashGroups).forEach((group) => {
    if (group.length > 1) {
      group.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      
      for (let i = 1; i < group.length; i++) {
        duplicatesToRemove.push({
          file: group[i],
          fileIndex: group[i].fileIndex
        });
      }
    }
  });
  
  console.log(`🔄 Found ${duplicatesToRemove.length} duplicates to remove`);
  return duplicatesToRemove;
};

const calculatesSaving = (sizeInBytes, currentClass, targetClass) => {
  const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);

  const prices = {
    standard: 0.023,
    glacier: 0.004,
    removal: 0
  };

  const currentCost = sizeInGB * prices[currentClass];
  const targetPrice = prices[targetClass] !== undefined ? prices[targetClass] : 0;
  const targetCost = sizeInGB * targetPrice;

  const savings = currentCost - targetCost;
  
  console.log(`💰 Calculate savings: ${sizeInGB.toFixed(4)}GB from ${currentClass} to ${targetClass} = $${savings.toFixed(6)}/mo`);
  
  return savings;
};

const analyzeFiles = (files) => {
  let totalSize = 0;
  let oldFilesCount = 0;

  const analyzedFiles = files.map((file) => {
    totalSize += file.size;

    const analysis = {
      isOld: isOldFile(file.lastModified),
      isDuplicate: false,
      recommendation: 'Keep',
      savingsPerMonth: 0
    };

    if (analysis.isOld) {
      oldFilesCount++;
      analysis.recommendation = 'Move to Cold Storage';
      analysis.savingsPerMonth = calculatesSaving(file.size, 'standard', 'glacier');
      console.log(`⏰ Old file: ${file.name} - Savings: $${analysis.savingsPerMonth.toFixed(6)}/mo`);
    }

    return {
      ...file,
      analysis
    };
  });

  const duplicates = findDuplicates(files);
  
  duplicates.forEach(({ file: dup, fileIndex }) => {
    if (fileIndex !== -1 && fileIndex < analyzedFiles.length) {
      const savingFromRemoval = calculatesSaving(dup.size, 'standard', 'removal');

      analyzedFiles[fileIndex].analysis.isDuplicate = true;
      
      if (analyzedFiles[fileIndex].analysis.isOld) {
        analyzedFiles[fileIndex].analysis.recommendation = 'Delete (Old + Duplicate)';
        analyzedFiles[fileIndex].analysis.savingsPerMonth = savingFromRemoval;
      } else {
        analyzedFiles[fileIndex].analysis.recommendation = 'Delete Duplicate';
        analyzedFiles[fileIndex].analysis.savingsPerMonth = savingFromRemoval;
      }
      
      console.log(`🗑️ Duplicate: ${analyzedFiles[fileIndex].name} - Savings: $${analyzedFiles[fileIndex].analysis.savingsPerMonth.toFixed(6)}/mo`);
    }
  });

  const finalTotalSaving = analyzedFiles.reduce((sum, file) => {
    return sum + file.analysis.savingsPerMonth;
  }, 0);

  let totalSpaceSavings = 0;
  analyzedFiles.forEach((file) => {
    if (file.analysis.isDuplicate) {
      totalSpaceSavings += file.size;
    }
  });

  console.log(`✅ Total savings: $${finalTotalSaving.toFixed(4)}/mo`);
  console.log(`📦 Space savings: ${(totalSpaceSavings / (1024 * 1024 * 1024)).toFixed(2)}GB`);

  return {
    summary: {
      totalSize,
      totalFiles: files.length,
      oldFiles: oldFilesCount,
      duplicates: duplicates.length,
      estimatedSavings: finalTotalSaving,
      spaceSavings: totalSpaceSavings
    },
    files: analyzedFiles
  };
};

module.exports = { analyzeFiles };