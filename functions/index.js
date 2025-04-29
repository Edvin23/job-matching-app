// Import 1st Gen Firebase Functions for Auth Triggers
const functions = require("firebase-functions");

// Import 2nd Gen Firebase Functions for HTTP Triggers
const functionsV2 = require("firebase-functions/v2");

// Import Firebase Admin SDK
const admin = require("firebase-admin");

// Import OpenAI
const OpenAI = require("openai");

// Initialize Firebase Admin
admin.initializeApp();

// HTTP function using 2nd Gen syntax
exports.helloWorld = functionsV2.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    // Log the new user's UID and email
    console.log(`New user created: UID=${user.uid}, Email=${user.email}`);

    // Randomly select between two profile images
    const profileImages = [
      "https://firebasestorage.googleapis.com/v0/b/imagelocation",
      "https://firebasestorage.googleapis.com/v0/b/imagelocation",
    ];
    const randomProfileImage = profileImages[
        Math.floor(Math.random() * profileImages.length)
    ];
    // Store profileImage and userEmails directly in the user's document
    await admin.firestore().collection("users").doc(user.uid).set({
      userProfile: {
        profileImage: randomProfileImage,
        userEmail: user.email,
      },
    }, {merge: true}); // Use merge to avoid overwriting existing fields

    // If you have additional logic, add it here
  } catch (error) {
    console.error("Error handling new user creation:", error);
  }
});

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

    // eslint-disable-next-line max-len
    const promptIntro = "Analyze this resume and match it with the most suitable jobs from the following list.";
    // eslint-disable-next-line max-len
    const promptInstructions = "Consider skills, experience, and qualifications. Return a JSON array of job matches with match percentage.";
    const prompt = `${promptIntro}
${promptInstructions}

Resume:
${resumeText}

Available Jobs:
${JSON.stringify(jobs, null, 2)}`;

    // eslint-disable-next-line max-len
    const systemMessage = "You are a professional job matching assistant. Analyze resumes and match them with job openings based on skills, experience, and qualifications.";

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
