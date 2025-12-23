const {analyzeFiles} = require('../utils/fileAnalyzer')

const analyze = (req,res)=>{
  try{
    const {files} = req.body

    //basic validation
    if(!files || !Array.isArray(files)){
      return res.status(400).json({error: 'Invalid data format'})
    }

    //analyze files
    const results = analyzeFiles(files)

    //returning results
    res.json(results)
  } catch(error){
    console.error('Error analyzing files:', error)
    res.status(500).json({error: 'Server error' })
  }
}

module.exports = {analyze}