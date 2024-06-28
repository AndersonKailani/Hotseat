$(document).ready(function() {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('username');

    if (!token || !currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Display profile picture and cover photo from localStorage if available
    const storedProfilePicture = localStorage.getItem('profilePicture');
    const storedCoverPhoto = localStorage.getItem('coverPhoto');

    if (storedProfilePicture) {
        $('#profile-picture').attr('src', storedProfilePicture);
    }

    if (storedCoverPhoto) {
        $('#cover-photo').attr('src', storedCoverPhoto);
    }

    // Display the current user's username
    $('#username').text(currentUser);

    // Handle profile picture upload
    $('#upload-profile-picture-btn').click(function() {
        $('#profile-picture-input').click();
    });

    $('#profile-picture-input').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const profilePictureUrl = e.target.result;
                $('#profile-picture').attr('src', profilePictureUrl);
                localStorage.setItem('profilePicture', profilePictureUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle cover photo upload
    $('#upload-cover-photo-btn').click(function() {
        $('#cover-photo-input').click();
    });

    $('#cover-photo-input').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const coverPhotoUrl = e.target.result;
                $('#cover-photo').attr('src', coverPhotoUrl);
                localStorage.setItem('coverPhoto', coverPhotoUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    // Function to handle image preview
    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#image-preview').attr('src', e.target.result).show();
        };
        reader.readAsDataURL(file);
    }

    // Handle file input change event
    $('#image-input').change(function() {
        const file = this.files[0];
        if (file) {
            previewImage(file);
        } else {
            $('#image-preview').attr('src', '#').hide();
        }
    });

    // Function to display posts
    function displayPosts(posts) {
        const userPostsContainer = $('#user-posts');
        userPostsContainer.empty();
        posts.forEach(post => {
            const likesCount = post.likes ? post.likes.length : 0;
            const postContent = post.image ? `<p>${post.text}</p><img src="${post.image}" class="post-image" style="max-width: 100%; height: auto;">` : `<p>${post.text}</p>`;
            const postElement = `
                <div class="post">
                    ${postContent}
                    <small>By <a href="profile.html?username=${post.username}">${post.username}</a> at ${new Date(post.createdAt).toLocaleString()}</small>
                    <div>
                        <span>Likes: ${likesCount}</span>
                    </div>
                </div>
            `;
            userPostsContainer.append(postElement);
        });
    }

    // Function to fetch user's posts
    function fetchUserPosts() {
        fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            return response.json();
        })
        .then(data => {
            const userPosts = data.filter(post => post.username === currentUser);
            console.log('Fetched user posts:', userPosts);
            displayPosts(userPosts);
        })
        .catch(error => console.error('Error fetching posts:', error));
    }

    // Function to upload image to local server and get image URL
    function uploadImageToServer(file) {
        const formData = new FormData();
        formData.append('image', file);

        return fetch('http://localhost:3000/uploads', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Image upload failed');
            }
            return response.json();
        })
        .then(data => {
            return data.imageUrl; // Return the image URL received from local server
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            alert('Image upload failed. Please try again.');
            throw error;
        });
    }

    // Function to create a post with image URL
    function createPostWithImage(postContent, imageUrl) {
        const postData = {
            text: postContent,
            username: currentUser,
            image: imageUrl // Ensure imageUrl is the image URL received from local server
        };

        fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(postData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message || 'Post creation failed');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Post created successfully');
            $('#postContent').val('');
            $('#image-input').val('');
            $('#image-preview').attr('src', '#').hide();
            fetchUserPosts(); // Refresh posts to include the newly created one
        })
        .catch(error => {
            console.error('Error creating post:', error);
            alert(error.message || 'Post creation failed. Please try again.');
        });
    }

    // Function to handle post submission
    function handlePostSubmission(postContent, imageUrl) {
        if (!postContent && !imageUrl) {
            alert('Post content cannot be empty');
            return;
        }

        if (imageUrl) {
            createPostWithImage(postContent, imageUrl);
        } else {
            createPost(postContent);
        }
    }

    // Function to create a post without image
    function createPost(postContent) {
        const postData = {
            text: postContent,
            username: currentUser
        };

        fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(postData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message || 'Post creation failed');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Post created successfully');
            $('#postContent').val('');
            fetchUserPosts(); // Refresh posts to include the newly created one
        })
        .catch(error => {
            console.error('Error creating post:', error);
            alert(error.message || 'Post creation failed. Please try again.');
        });
    }

    // Event listener for post form submission
    $('#post-form').submit(function(event) {
        event.preventDefault();
        const postContent = $('#postContent').val().trim();
        const fileInput = $('#image-input')[0];

        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileData = e.target.result;
                uploadImageToServer(fileInput.files[0])
                    .then(imageUrl => {
                        handlePostSubmission(postContent, imageUrl);
                    })
                    .catch(error => {
                        console.error('Error fetching image:', error);
                        alert('Failed to fetch image. Please try again.');
                    });
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            createPost(postContent);
        }
    });

    // Handle logout
    $('#logout').click(function() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });

    // Initial fetch of user posts
    fetchUserPosts();
});
