import User from "../models/User.js";

const fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found"
      });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

export { fetchAllUsers };
