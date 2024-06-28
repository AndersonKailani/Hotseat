$(document).ready(function() {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('username');
    const userProfilePic = localStorage.getItem('profilePicture');
    const defaultProfilePic = '/caro/alien.jpg';

    if (!token || !currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const POSTS_PER_PAGE = 20;
    let currentPage = 1;
    let totalPosts = 0;

    function displayPosts(posts) {
        const postsContainer = $('#all-posts-container');
        postsContainer.empty();
        posts.forEach(post => {
            const userLike = post.likes.find(like => like.username === currentUser);
            const likeId = userLike ? userLike._id : null;
            const profilePic = post.username === currentUser ? userProfilePic : defaultProfilePic;
    
            let postContent = `
                <div class="post">
                    <div class="post-header">
                        <img src="${profilePic}" alt="Profile Picture" class="post-profile-pic">
                        <span class="post-username"><a href="profile.html?username=${post.username}">${post.username}</a></span>
                        <span class="post-date">${new Date(post.createdAt).toLocaleString()}</span>
                        <span class="delete-btn" data-post-id="${post._id}">&times;</span>
                    </div>
                    <p>${post.text}</p>
            `;
    
            if (post.sharedPost) {
                postContent += `
                    <div class="shared-post">
                        <p>${post.sharedPost.text}</p>
                        <small>Originally by <a href="profile.html?username=${post.sharedPost.username}">${post.sharedPost.username}</a></small>
                    </div>
                `;
            }
    
            postContent += `
                <div class="post-actions">
                    <span class="like-count">${post.likes.length}</span>
                    <button class="like-btn ${likeId ? 'liked' : ''}" data-post-id="${post._id}" data-like-id="${likeId || ''}">
                        ${likeId ? '&#x2764;' : '&#x2661;'}
                    </button>
                    <button class="share-btn" data-post-id="${post._id}">Share</button>
                </div>
                </div>
            `;
            postsContainer.append(postContent);
        });
    }
    

    function fetchPosts() {
        fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => response.json())
        .then(data => displayPosts(data))
        .catch(error => console.error('Error:', error));
    }

    function updateLikeCount(postId, change) {
        const likeCountSpan = $(`[data-post-id="${postId}"]`).siblings('.like-count');
        const currentCount = parseInt(likeCountSpan.text());
        likeCountSpan.text(currentCount + change);
    }

    function handleLike(postId) {
        fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ postId: postId })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message || 'Failed to like post');
                });
            }
            return response.json();
        })
        .then(data => {
            updateLikeCount(postId, 1);
            const likeButton = $(`[data-post-id="${postId}"]`).filter('.like-btn');
            likeButton.addClass('liked').html('&#x2764;');
            likeButton.data('like-id', data._id); // Store the likeId
        })
        .catch(error => console.error('Error liking post:', error));
    }

    function handleUnlike(postId, likeId) {
        fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${likeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message || 'Failed to unlike post');
                });
            }
            return response.json();
        })
        .then(data => {
            updateLikeCount(postId, -1);
            const likeButton = $(`[data-post-id="${postId}"]`).filter('.like-btn');
            likeButton.removeClass('liked').html('&#x2661;');
            likeButton.data('like-id', ''); // Clear the likeId
        })
        .catch(error => console.error('Error unliking post:', error));
    }

    function handleShare(postId) {
        fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts/${postId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch post details');
            }
            return response.json();
        })
        .then(originalPost => {
            fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    text: `Shared post: ${originalPost.text}`,
                    sharedPost: {
                        username: originalPost.username,
                        text: originalPost.text
                    }
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.message || 'Failed to share post');
                    });
                }
                return response.json();
            })
            .then(data => {
                alert('Post shared successfully');
                fetchPosts(); // Refresh posts to include the shared post
            })
            .catch(error => console.error('Error sharing post:', error));
        })
        .catch(error => console.error('Error fetching post details:', error));
    }

    function handleDelete(postId) {
        fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message || 'Failed to delete post');
                });
            }
            alert('Post deleted successfully');
            fetchPosts(); // Refresh posts to remove the deleted post
        })
        .catch(error => console.error('Error deleting post:', error));
    }

   
    $('#logout').click(function() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });

    $(document).on('click', '.like-btn', function() {
        const postId = $(this).data('post-id');
        const likeId = $(this).data('like-id');
        const alreadyLiked = $(this).hasClass('liked');

        if (!alreadyLiked) {
            handleLike(postId);
        } else {
            handleUnlike(postId, likeId);
        }
    });

    $(document).on('click', '.share-btn', function() {
        const postId = $(this).data('post-id');
        handleShare(postId);
    });

    $(document).on('click', '.delete-btn', function() {
        const postId = $(this).data('post-id');
        if (confirm('Are you sure you want to delete this post?')) {
            handleDelete(postId);
        }
    });

    fetchPosts();
});
