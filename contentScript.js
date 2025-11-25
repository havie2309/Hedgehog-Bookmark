(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    // Listen for messages from popup and background script
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;
        } else if (type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });

            response(currentVideoBookmarks);
        }
    });

    // Fetch bookmarks for current video from storage
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    };

    // Initialize bookmark button when new video loads
    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        currentVideoBookmarks = await fetchBookmarks();

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button bookmark-btn";
            bookmarkBtn.title = "Let the Hedgehog save your spot!";

            // Wait for YouTube controls to load with retry mechanism
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max
            
            const checkControls = setInterval(() => {
                youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
                youtubePlayer = document.getElementsByClassName("video-stream")[0];
                attempts++;

                if (youtubeLeftControls && youtubePlayer) {
                    clearInterval(checkControls);
                    youtubeLeftControls.appendChild(bookmarkBtn);
                    bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkControls);
                    console.log("YouTube controls not found after maximum attempts");
                }
            }, 100);
        }
    };

    // Add new bookmark when button is clicked
    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime), 
        };

        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    };

    // Format time as HH:MM:SS
    const getTime = (t) => {
        const date = new Date(0);
        date.setSeconds(t);
        return date.toISOString().substring(11, 19); 
    };
})();