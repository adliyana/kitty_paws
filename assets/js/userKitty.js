document.addEventListener('DOMContentLoaded', function () { 
    // Clear localStorage when the page is refreshed
    localStorage.clear(); // This will clear all localStorage data

    let isSwiping = false;
    let isMouseDown = false;
    let currentIndex = 0; // To track the index of the current image
    let likedCats = JSON.parse(localStorage.getItem('likedCats')) || [];
    let dislikedCats = JSON.parse(localStorage.getItem('dislikedCats')) || [];
    let catImages = []; // Array to hold 5 fetched cat images
    let totalImages = 15; // Limit to 5 images

    // Fetch the first 5 cat images from Cataas API
    fetchCatImages();

    const swipeContainer = document.getElementById('swipeContainer');
    const catImage = document.getElementById('catImage');
    const actionLeft = document.querySelector('.action-left');
    const actionRight = document.querySelector('.action-right');
    const likedCatsCounter = document.getElementById('likedCatsCounter');
    const dislikedCatsCounter = document.getElementById('dislikedCatsCounter');
    const messageContainer = document.getElementById('messageContainer');

    swipeContainer.addEventListener('touchstart', handleTouchStart, false);
    swipeContainer.addEventListener('touchmove', handleTouchMove, false);
    swipeContainer.addEventListener('touchend', handleTouchEnd, false);

    swipeContainer.addEventListener('mousedown', handleMouseDown, false);
    swipeContainer.addEventListener('mousemove', handleMouseMove, false);
    swipeContainer.addEventListener('mouseup', handleMouseUp, false);
    swipeContainer.addEventListener('mouseleave', handleMouseUp, false);

    const gifImage = document.createElement('img');
    gifImage.src = 'cat.gif'; // Replace with the correct path if needed
    gifImage.alt = 'Cat GIF';
    messageContainer.appendChild(gifImage);

    function handleTouchStart(event) {
        startX = event.touches[0].clientX;
        isSwiping = true;
    }

    function handleTouchMove(event) {
        if (!isSwiping) return;

        const currentX = event.touches[0].clientX;
        const distance = currentX - startX;
        updateSwipe(distance);
    }

    function handleTouchEnd(event) {
        isSwiping = false;
        const distance = endX - startX;
        processSwipe(distance);
    }

    function handleMouseDown(event) {
        if (event.button !== 0) return;
        startX = event.clientX;
        isSwiping = true;
        isMouseDown = true;
    }

    function handleMouseMove(event) {
        if (!isSwiping || !isMouseDown) return;

        const currentX = event.clientX;
        const distance = currentX - startX;
        updateSwipe(distance);
    }

    function handleMouseUp(event) {
        if (!isMouseDown) return;
        isSwiping = false;
        isMouseDown = false;
        endX = event.clientX;
        const distance = endX - startX;
        processSwipe(distance);
    }

    function updateSwipe(distance) {
        catImage.style.transform = `translateX(${distance}px)`;
        const threshold = 50;

        if (Math.abs(distance) > threshold) {
            if (distance < 0) {
                actionRight.style.display = 'none';
                actionLeft.style.display = 'block';
            } else {
                actionLeft.style.display = 'none';
                actionRight.style.display = 'block';
            }
        }
    }

    function processSwipe(distance) {
        const threshold = 50;

        if (distance > threshold) {
            updateCatStatus(1); // Liked
        } else if (distance < -threshold) {
            updateCatStatus(0); // Disliked
        } else {
            resetSwipe();
        }
    }

    function resetSwipe() {
        catImage.style.transform = 'translateX(0)';
        actionLeft.style.display = 'none';
        actionRight.style.display = 'none';
    }

    async function fetchCatImages() {
        try {
            for (let i = 0; i < totalImages; i++) {
                const response = await fetch('https://cataas.com/cat');
                if (response.ok) {
                    const imageBlob = await response.blob();
                    const imageUrl = URL.createObjectURL(imageBlob);
                    catImages.push(imageUrl);
                } else {
                    console.error('Failed to fetch the cat image from Cataas API.');
                    catImages.push('https://placekitten.com/400/400'); // Fallback image
                }
            }

            if (catImages.length > 0) {
                catImage.src = catImages[currentIndex];
            }
        } catch (error) {
            console.error('Error fetching the cat images:', error);
            catImage.src = 'https://placekitten.com/400/400'; // Fallback image
        }
    }

    function updateCatStatus(liked) {
        const catData = {
            id: currentIndex,
            image: catImage.src
        };

        if (liked === 1) {
            likedCats.push(catData);
            localStorage.setItem('likedCats', JSON.stringify(likedCats));
        } else if (liked === 0) {
            dislikedCats.push(catData);
            localStorage.setItem('dislikedCats', JSON.stringify(dislikedCats));
        }

        currentIndex++;

        if (currentIndex < catImages.length) {
            catImage.src = catImages[currentIndex];
        } else {
            // Show results after all images are swiped
            showResults();
        }

        resetSwipe();
    }

    function showResults() {
        // Hide the swiping UI
        swipeContainer.style.display = 'none';
        messageContainer.style.display = 'block';
        messageContainer.textContent = `You have liked ${likedCats.length} cats. Thank you for swiping!`;
        document.getElementById('swipeInstruction').style.display = 'none';

        // Display liked cats and total liked count
        likedCatsCounter.style.display = 'block';
        // likedCatsCounter.textContent = `Total Liked Cats: ${likedCats.length}`;
        showLikedAndDislikedCats();
    }

    function showLikedAndDislikedCats() {
        const likedContainer = document.getElementById('likedCatsContainer');
        const dislikedContainer = document.getElementById('dislikedCatsContainer');

        likedContainer.innerHTML = '';
        // dislikedContainer.innerHTML = '';

        likedCats.forEach(cat => {
            const img = document.createElement('img');
            img.src = cat.image;
            img.alt = 'Liked Cat';
            likedContainer.appendChild(img);
        });
    }

    // Initialize counters on page load
    showLikedAndDislikedCats();
});
