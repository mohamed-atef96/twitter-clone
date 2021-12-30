// detect when page content is load
document.addEventListener("DOMContentLoaded", () => {
    const tweetText = document.getElementById("tweetText");
    const replayText = document.getElementById("replayText");
    const submitBtn = document.getElementById("submit");
    const replayBtn = document.getElementById("submitReplyButton");
    const model = document.getElementById("replyModal");
    // enable and disable form button
    tweetText.addEventListener("keyup", () => {
      const tweetValue = tweetText.value;
      submitBtn.removeAttribute("disabled");
      if (!tweetValue) {
        submitBtn.setAttribute("disabled", "disabled");
      }
    });
  
    // enable and disable form button
    replayText.addEventListener("keyup", () => {
      const tweetValue = replayText.value;
      replayBtn.removeAttribute("disabled");
      if (!tweetValue) {
        replayBtn.setAttribute("disabled", "disabled");
      }
    });
  
    retrieveTweets();
  
    // submit tweet to database
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const content = tweetText.value;
      const formData = new FormData();
      formData.append("content", content);
      tweetText.value = "";
      submitBtn.setAttribute("disabled", "disabled");
      const tweetsContainer = document.getElementById("tweetsContainer");
      tweet(formData, tweetsContainer);
    });

  });
  