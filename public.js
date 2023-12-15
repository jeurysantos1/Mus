const APIController = (function () {
    const clientId = '9cb1f2aa68bf4b1ca06b3951d8afd6aa';
    const clientSecret = 'd95cc066f0f84698be5cc1efebc7e607';

    const _getToken = async () => {
        
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getArtistId = async (token, artistName) => {
        const result = await fetch(`https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(artistName)}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await result.json();
        const artistId = data.artists.items[0].id; // Get the ID of the first artist (assuming it's the most relevant)
        return artistId;
    }

    const _getArtistInfo = async (token, artistId) => {
        const result = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await result.json();
        return data; // Returns information about the specific artist
    }

    return {
        _getToken,
        _getArtistId,
        _getArtistInfo
    };
})();

// Usage example
// APIController remains the same

function searchArtist() {
    const artistInput = document.getElementById('searchInput').value.trim();

    APIController._getToken()
        .then(async (token) => {
            console.log('Access Token:', token);

            const artistName = artistInput; // Use the user-entered value as the artist name
            const artistId = await APIController._getArtistId(token, artistName);
            console.log('Artist ID:', artistId);

            const artistInfo = await APIController._getArtistInfo(token, artistId);
            console.log('Artist Information:', artistInfo);


    

             // Update the h1 element with the artist's name
             document.getElementById('artistNameTitle').innerText = artistInfo.name;
             

            // Update the image source with the artist's image from the API
            const artistImage = document.getElementById('image');
            if (artistInfo.images && artistInfo.images.length > 0) {
                artistImage.src = artistInfo.images[0].url; // Assuming the first image is used
                artistImage.alt = artistInfo.name; // Set alt text to the artist's name
            }

             // Update the second image (main-image) with a different image from the API (if available)
             const mainImage = document.getElementById('main-image');
             if (artistInfo.images && artistInfo.images.length > 2) {
                 mainImage.src = artistInfo.images[1].url; // Assuming the second image is used
                 mainImage.alt = artistInfo.name; // Set alt text to the artist's name
             }
            
            // Update the follower count in the HTML
            const followersCount = document.getElementById('followersCount');
            followersCount.innerText = `Followers count: ${artistInfo.followers.total}`;

            //update the gender
            const genreType = document.getElementById('genreType');
            if (artistInfo.genres && artistInfo.genres.length > 2) {
                genreType.innerText = `Genre: ${artistInfo.genres[2]}`;
            } else {
                genreType.style.display = 'none'; // Hide the genre element if the information is undefined
            }

            //update the popularity
            const Popularity = document.getElementById('popularity');
            Popularity.innerText = `Popularity: ${artistInfo.popularity}`;


            const topTracksResult = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const topTracksData = await topTracksResult.json();
            const topTracksList = document.getElementById('topTracksList');

//// Display the top tracks in a list
topTracksData.tracks.slice(0,4).forEach((track, index) => {
    const listItem = document.createElement('li');
    
   
    // Create the card overlay
    const cardOverlay = document.createElement('div');
    cardOverlay.classList.add('card-overlay');
    cardOverlay.style.width = '150px';
    cardOverlay.style.height = '150px';
    cardOverlay.style.paddingLeft = '5px';
    cardOverlay.classList.add('card-overlay'); 

    // Create an h2 element for the track name
    const trackTitle = document.createElement('h2');
    trackTitle.textContent = track.name;
    cardOverlay.appendChild(trackTitle);

    // Create a p element for the track description
    const trackDescription = document.createElement('p');
    trackDescription.textContent = `Track ${index + 1} Description`; // Example description
    cardOverlay.appendChild(trackDescription);

    // Set the track cover image as background (if available)
    if (track.album && track.album.images && track.album.images.length > 0) {
        cardOverlay.style.backgroundImage = `url('${track.album.images[0].url}')`;
        cardOverlay.style.backgroundSize = 'cover';
        cardOverlay.style.backgroundPosition = 'center';
    }

    // Append the card overlay to the list item
    listItem.appendChild(cardOverlay);

    // Append the list item to the topTracksList
    topTracksList.appendChild(listItem);

    // Log the parent-child relationship
    console.log(`List Item: ${listItem.tagName} (Parent) -> Card Overlay: ${cardOverlay.tagName} (Child)`);
});



    
            
        })
       
        .catch((error) => {
            console.error('Error:', error);
        });
}

