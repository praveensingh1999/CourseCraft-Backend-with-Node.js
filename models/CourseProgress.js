import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
     
    },

    completedVideos : [
        {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    }
    ],

      
      
    
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
},

    
});

const courseProgress = mongoose.model("courseProgress",  courseProgressSchema);

export default courseProgress;
