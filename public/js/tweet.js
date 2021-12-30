// retrieve tweet id from reply
document.addEventListener("DOMContentLoaded", (e) => {
  const tweetContainer = document.getElementById("tweet-container");
  const repliesContainer = document.getElementById("replies-container");
  // fetch tweet with api
  fetch(`http://localhost:3000/api/tweet/${tweetId}`)
    .then((response) => response.json())
    .then((tweetData) => {
      const tweet = createTweetComponent(tweetData);
      tweetContainer.insertAdjacentHTML("afterbegin", tweet);
    });

  const formData = new FormData();
  formData.append("tweetId", tweetId);
  
  // retrieve replies for tweet
  fetch("http://localhost:3000/api/tweet/get/replies", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((replies) => {
      replies.forEach((replyData) => {
        const reply = createTweetComponent(replyData);
        repliesContainer.insertAdjacentHTML("afterbegin", reply);
      });
    });
});
