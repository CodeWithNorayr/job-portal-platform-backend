import Company from "../models/Company.js";

const getCompaniesData = async ( req, res ) => {
  try {
    const companies = await Company.find().select("-password")
    if(companies.length === 0){
      return res.status(404).json({
        success:false,
        message:"No companies found"
      })
    }
    res.status(200).json({
      success:true,
      data:companies
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company"
  })  
  }
}

export default getCompaniesData