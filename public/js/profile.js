document.addEventListener("DOMContentLoaded", () => {
  const tweetsContainer = document.getElementById("tweetsContainer");
  const userId = JSON.parse(profileUser)._id;
  // retrieve replies for tweet
  fetch(`http://localhost:3000/api/tweet/get/user/${userId}`)
    .then((res) => res.json())
    .then((tweets) => {
      console.log(tweets);
        tweets.forEach((tweetData) => {
          const tweet = createTweetComponent(tweetData);
          tweetsContainer.insertAdjacentHTML("afterbegin", tweet);
        });
    });
});
