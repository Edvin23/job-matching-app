// Import Firebase Functions
const functions = require("firebase-functions");
const functionsV2 = require("firebase-functions/v2");
const functionsV1 = require("firebase-functions/v1");

// Import Firebase Admin SDK
const admin = require("firebase-admin");

// Import OpenAI
const OpenAI = require("openai");

// Initialize Firebase Admin
admin.initializeApp();

// HTTP function using 2nd Gen syntax
// exports.helloWorld = functionsV2.https.onRequest((req, res) => {
//   res.send("Hello from Firebase!");
// });

// Auth trigger for new user creation
exports.onUserCreate = functionsV1.auth.user().onCreate((userRecord) => {
  // Log the new user's UID and email
  console.log(
      `New user created: UID=${userRecord.uid}, Email=${userRecord.email}`);

  // Randomly select between two profile images
  const profileImages = [
    "https://firebasestorage.googleapis.com/v0/b/job-matching-app-4e495.appspot.com/o/profile1.jpg",
    "https://firebasestorage.googleapis.com/v0/b/job-matching-app-4e495.appspot.com/o/profile2.jpg",
  ];
  const randomProfileImage = profileImages[
      Math.floor(Math.random() * profileImages.length)
  ];

  // Store profileImage and userEmail in the user's document
  return admin.firestore().collection("users").doc(userRecord.uid).set({
    userProfile: {
      profileImage: randomProfileImage,
      userEmail: userRecord.email,
    },
  }, {merge: true}); // Use merge to avoid overwriting existing fields
});

// Function to analyze resume and match with jobs
exports.analyzeResume = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new Error("Authentication required");
    }

    const {resumeText} = data;
    if (!resumeText) {
      throw new Error("Resume text is required");
    }

    // Get all job openings from Firestore
    const jobsSnapshot = await admin.firestore().collection("jobs").get();
    const jobs = [];
    jobsSnapshot.forEach((doc) => {
      jobs.push({id: doc.id, ...doc.data()});
    });

    // Use OpenAI to analyze the resume and match with jobs
    const openai = new OpenAI({
      apiKey: functions.config().openai.api_key,
    });

    // Split long prompt into multiple lines
    const promptIntro =
      "Analyze this resume and match it with the most suitable jobs " +
      "from the following list.";
    const promptInstructions =
      "Consider skills, experience, and qualifications. " +
      "Return a JSON array of job matches with match percentage.";
    const prompt = `${promptIntro}
${promptInstructions}

Resume:
${resumeText}

Available Jobs:
${JSON.stringify(jobs, null, 2)}`;

    // Split long system message into multiple lines
    const systemMessage =
      "You are a professional job matching assistant. " +
      "Analyze resumes and match them with job openings based on " +
      "skills, experience, and qualifications.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {type: "json_object"},
    });

    const matches = JSON.parse(completion.choices[0].message.content);

    // Store the analysis in Firestore
    await admin.firestore()
        .collection("users")
        .doc(context.auth.uid)
        .collection("resumeAnalyses")
        .add({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          resumeText,
          matches,
        });

    return {matches};
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume");
  }
});
