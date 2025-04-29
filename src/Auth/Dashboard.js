import './Dashboard.css';
import React, { useEffect, useState, useRef } from 'react';
import { auth, db, functions, storage } from './..firebase';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import UserPrompts from './UserPrompts';
import ResumeAI from './ResumeAI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/react-fontawesome';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { loadStripe } from '@stripe/stripe-js';
import { signOut } from 'firebase/auth';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [quote, setQuote] = useState(null);
    const [prompts, setPrompts] = useState([]); // State for prompts array
    const [AIResponses, setAIResponses] = useState([]); // State for AI responses array
    const [loading, setLoading] = useState(true); // For loading state
    const [error, setError] = useState(null); // For error handling
    const [uploading, setUploading] = useState(false); // For upload loading state
    const [uploadError, setUploadError] = useState(null); // For upload error
    const [resumeAnalysis, setResumeAnalysis] = useState(null); // For resume analysis results
    const [analyzingResume, setAnalyzingResume] = useState(false); // For resume analysis loading state
    const navigate = useNavigate(); // If using react-router
    const fileInputRef = useRef(null); // Ref for hidden file input
    const resumeInputRef = useRef(null); // Ref for hidden resume input

    // Purchase State
    const [purchaseButtonText, setPurchaseButtonText] = useState("Purchase");

    // Fixed price
    const purchasePrice = "5.00"; // Fixed price of $5.00

    const initiatePurchase = async () => {
        setPurchaseButtonText("Processing...");
        try {
            const functionsInstance = functions;
            const createSession = httpsCallable(functionsInstance, 'startPaymentSession'); // Renamed cloud function

            // Retrieve gclid from localStorage if needed
            const gclid = localStorage.getItem('gclid') || '';

            // Prepare payload
            const payload = {
                plan: 'Messagly', // Fixed plan name
                gclid: gclid,
            };

            // Call the Firebase function with the prepared payload
            const response = await createSession(payload);
            
            const { sessionId } = response.data;
            const stripe = await stripePromise;

            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                // Handle Stripe redirection errors
                setPurchaseButtonText("Retry");
            } else {
                // Reset button text if redirection is successful
                setPurchaseButtonText("Purchase");
            }
        } catch (err) {
            // Handle errors from the backend function
            console.error('Purchase Error:', err);
            setPurchaseButtonText("Retry");
        }
    };

    const handlePurchaseClick = () => {
        initiatePurchase();
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                // Fetch user profile from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data());
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleUserPromptSubmit = async (prompt) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                // Add the prompt to 'prompts' array
                await updateDoc(userDocRef, {
                    prompts: arrayUnion(prompt),
                });

                // Call the Firebase Cloud Function to generate AI response
                const generateAI = httpsCallable(functions, 'generateAIReply'); // Renamed cloud function
                const result = await generateAI({ userPrompt: prompt });

                if (result.data && result.data.reply) {
                    const aiReply = result.data.reply;
                    // Add the AI response to 'AIResponses' array
                    await updateDoc(userDocRef, {
                        AIResponses: arrayUnion(aiReply),
                    });
                } else {
                    console.error('Invalid response from Cloud Function:', result.data);
                    setError('Failed to get a valid response from AI.');
                }
            } catch (err) {
                console.error('Error handling user prompt submission:', err);
                setError('Failed to submit prompt or retrieve AI response.');
            }
        } else {
            setError('User not authenticated.');
        }
    };

    // Handler for file input change
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError(null);

        const user = auth.currentUser;
        if (!user) {
            setUploadError('User not authenticated.');
            setUploading(false);
            return;
        }

        // Check file size (e.g., 2 GB limit)
        if (file.size > 2 * 1024 * 1024 * 1024) {
            setUploadError('File size exceeds 2 GB.');
            setUploading(false);
            return;
        }

        try {
            // Create a storage reference
            const storageRefInstance = ref(storage, `profile_pictures/${user.uid}/${file.name}`);
            
            // Upload the file
            await uploadBytes(storageRefInstance, file);
            
            // Get the download URL
            const downloadURL = await getDownloadURL(storageRefInstance);

            // Update the user's profile in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                'userProfile.profileImage': downloadURL,
            });

            // Update local state
            setUserProfile((prevProfile) => ({
                ...prevProfile,
                profileImage: downloadURL,
            }));

        } catch (err) {
            console.error('Error uploading file:', err);
            setUploadError('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    // Function to trigger the hidden file input
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handler for resume file change
    const handleResumeChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setAnalyzingResume(true);
        setUploadError(null);

        const user = auth.currentUser;
        if (!user) {
            setUploadError('User not authenticated.');
            setAnalyzingResume(false);
            return;
        }

        // Check file type (only allow PDF and DOC/DOCX)
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Please upload a PDF or Word document.');
            setAnalyzingResume(false);
            return;
        }

        try {
            // Read the file content
            const text = await file.text();
            
            // Call the analyzeResume Cloud Function
            const analyzeResume = httpsCallable(functions, 'analyzeResume');
            const result = await analyzeResume({ resumeText: text });
            
            // Update state with analysis results
            setResumeAnalysis(result.data.matches);
        } catch (err) {
            console.error('Error analyzing resume:', err);
            setUploadError('Failed to analyze resume.');
        } finally {
            setAnalyzingResume(false);
        }
    };

    // Function to trigger the hidden resume input
    const handleResumeUploadClick = () => {
        resumeInputRef.current.click();
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="user-profile">
                    <img
                        src={userProfile?.profileImage || user.photoURL || 'https://via.placeholder.com/60'}
                        alt="Profile"
                        className="profile-image"
                    />
                    <div className="user-info">
                        <h2>{user.displayName || user.email}</h2>
                        <p className="quote">"Your career journey starts here"</p>
                    </div>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-section">
                    <h3>Resume Analysis</h3>
                    <ResumeAI />
                </div>
                <div className="dashboard-section">
                    <h3>AI Assistant</h3>
                    <UserPrompts
                        prompts={prompts}
                        onSubmit={handleUserPromptSubmit}
                        AIResponses={AIResponses}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;