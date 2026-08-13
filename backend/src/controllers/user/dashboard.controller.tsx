import participantModel from "../models/participant.model";
import meetingModel from "../models/meeting.model";
import userModel from "../models/user.model";

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    