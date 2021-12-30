// detect when page content is load
document.addEventListener("DOMContentLoaded", () => {
  const replayText = document.getElementById("replayText");
  const replayBtn = document.getElementById("submitReplyButton");
  const model = document.getElementById("replyModal");

  // enable and disable form button
  replayText.addEventListener("keyup", () => {
    const tweetValue = replayText.value;
    replayBtn.removeAttribute("disabled");
    if (!tweetValue) {
      replayBtn.setAttribute("disabled", "disabled");
    }
  });

  //like button
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id == "likeButton") {
      const button = e.target;
      const root = button.closest(".tweet");
      const tweetId = root.getAttribute("data-id");
      fetch(`http://localhost:3000/api/tweet/like/${tweetId}`, {
        method: "PUT",
      })
        .then((res) => res.json())
        .then((tweet) => {
          button.nextSibling.nextSibling.innerHTML = tweet.likes.length || "";
          if (tweet.likes.includes(userLoggedIn._id)) {
            button.classList.add("liked");
          } else {
            button.classList.remove("liked");
          }
        });
    }
  });

  //retweet button
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id == "retweetButton") {
      const button = e.target;
      const root = button.closest(".tweet");
      const tweetId = root.getAttribute("data-id");
      fetch(`http://localhost:3000/api/tweet/retweet/${tweetId}`, {
        method: "PUT",
      })
        .then((res) => res.json())
        .then((tweet) => {
          console.log(tweet);
          button.nextSibling.nextSibling.innerHTML =
            tweet.retweets.length || "";
          if (tweet.retweets.includes(userLoggedIn._id)) {
            button.classList.add("retweeted");
          } else {
            button.classList.remove("retweeted");
          }
        });
    }
  });

  // retrieve tweet id from reply
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id == "replyButton") {
      const button = e.target;
      const root = button.closest(".tweet");
      const tweetId = root.getAttribute("data-id");
      model.setAttribute("data-id", tweetId);
      fetch(`http://localhost:3000/api/tweet/${tweetId}`)
        .then((response) => response.json())
        .then((tweet) => {
          showReplayTweet(tweet);
        });
    }
  });

  //submit reply
  replayBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const content = replayText.value;
    const model = e.target.closest("#replyModal");
    const tweetId = model.getAttribute("data-id");
    const formData = new FormData();
    formData.append("content", content);
    formData.append("replyTo", tweetId);
    fetch("http://localhost:3000/api/tweet/reply", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => location.reload());
  });

  // navigate to tweet page
  document.addEventListener("click", (e) => {
    if (e.target) {
      if (
        e.target.className == "tweet-content" ||
        e.target.className == "tweet-body" ||
        e.target.className == "tweet-text"
      ) {
        const button = e.target;
        const root = button.closest(".tweet");
        const tweetId = root.getAttribute("data-id");
        window.location.href = "/api/tweet/view/" + tweetId;
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target && e.target.id == "deleteBtn") {
      tweetId = e.target.getAttribute("data-id");
      fetch(`http://localhost:3000/api/tweet/${tweetId}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((msg) => location.reload());
    }
  });
});

//show tweet in replay popup
function showReplayTweet(tweet) {
  const tweetContainer = document.getElementById("originalTweetContainer");
  const tweetHtml = createTweetComponent(tweet);
  tweetContainer.innerHTML = tweetHtml;
}

// retrieve all tweets from database
function retrieveTweets() {
  fetch("http://localhost:3000/api/tweet/get")
    .then((response) => response.json())
    .then((tweets) => {
      if (tweets.length == 0) {
        tweetsContainer.innerHTML =
          "<span class='noResults text-center mt-4 fw-bold'>Nothing to show.</span>";
      }
      tweets.forEach((data) => {
        const tweet = createTweetComponent(data);
        tweetsContainer.insertAdjacentHTML("afterbegin", tweet);
      });
    });
}

// send tweet to database
function tweet(formData, container) {
  fetch("http://localhost:3000/api/tweet/create", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      const tweet = createTweetComponent(data);
      container.insertAdjacentHTML("afterbegin", tweet);
    });
}

//get tweet and insert to page
function createTweetComponent(tweet) {
  var isRetweet = tweet.retweetData !== undefined;
  var retweetedBy = isRetweet ? tweet.postedBy.userName : null;
  tweet = isRetweet ? tweet.retweetData : tweet;
  if (tweet !== null) {
    var postedBy = tweet.postedBy;

    const displayName = postedBy.firstName + " " + postedBy.lastName;
    const createdAt = timeDifference(new Date(), new Date(tweet.createdAt));
    const buttonClass = tweet.likes.includes(userLoggedIn._id) ? "liked" : "";
    const retweetClass = tweet.retweets.includes(userLoggedIn._id)
      ? "retweeted"
      : "";

    var retweetText = "";
    if (isRetweet) {
      retweetText = `<span class="d-flex align-items-center ml-5">
                      <i class='fas fa-retweet mr-2'></i>
                      <span class="mr-2">Retweeted by </span><a href='/profile/${retweetedBy}' style="color:gray"> @${retweetedBy}</a>    
                  </span>`;
    }

    let replyFlag = "";
    if (tweet.replyTo && tweet.replyTo._id) {
      var replyToUsername = tweet.replyTo.postedBy.userName;
      replyFlag = `<div class='replyFlag d-flex'>
                  Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
              </div>`;
    }
    let deleteBtn = "";
    if (tweet.postedBy._id == userLoggedIn._id) {
      deleteBtn = `<i  data-id="${tweet._id}" class='fas fa-times' style="float:right" id="deleteBtn"></i>`;
    }

    return `<div class='tweet' data-id="${tweet._id}">
                  ${retweetText}
                <div class='tweet-container'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='tweet-content'>
                        <div class='header'>
                        <a href='/profile/${
                          postedBy.userName
                        }' class='display-name'>${displayName}</a>
                        <span class='user-name'>@${postedBy.userName}</span>
                        <span class='date'>${createdAt}</span>
                        ${deleteBtn}
                        </div>
                        ${replyFlag}
                            <div class='tweet-body'>
                            <span class="tweet-text">${tweet.content}</span>
                        </div>
                        <div class='tweet-footer'>
                            <div class='tweet-button-container'>
                                <button    data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment' id="replyButton"></i>
                                    <span id="replyCount"></span>
                                </button>
                            </div>
                            <div class='tweet-button-container'>
                                <button>
                                    <i class='fas fa-retweet  ${retweetClass}' id="retweetButton"></i>
                                    <span>${tweet.retweets.length || " "}</span>
                                </button>
                            </div>
                            <div class='tweet-button-container'>
                                <button>
                                <div>
                                    <i class='far fa-heart ${buttonClass}' id="likeButton"></i>
                                    <span>${tweet.likes.length || " "}</span>
                                  </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
  }
  else{
  return `<div class="deleted mt-2" >
            <span class="d-flex align-items-center ml-5">
            <i class='fas fa-retweet mr-2'></i>
            <span class="mr-2">Retweeted by </span><a href='/profile/${retweetedBy}' style="color:gray"> @${retweetedBy}</a>    
            </span>
            <div class="message"> deleted tweet</div>
          </div>`
          };
}

// calc data of tweet
function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";

    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}
