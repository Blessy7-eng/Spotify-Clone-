console.log("Let's write javascript")
let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if(isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

//returns all songs from Songs folder
async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for(const song of songs) { 
        songUL.innerHTML = songUL.innerHTML + `<br><li>
                        <img src="/svgFiles/music.svg" alt="" class="invert">
                        <div class="info">
                            <div class="">${song.replaceAll("%20", " ").replaceAll("%2C", ",")}</div>
                            <div>Song Artist</div>
                        </div>
                        <div class="playNow flex">
                            <span>Play Now</span>
                            <img src="/svgFiles/playbar.svg" alt="" class="invert">
                        </div> 
                        </li>`;
    }

    //Attach an eventlistner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
          console.log(e.querySelector(".info").firstElementChild.innerHTML)  
          playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        
    })

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "/svgFiles/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbum() {
    console.log("displaying album")
    let a = await fetch(`/Songs/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")
    let array  = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/Songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];
            // Get the metadata of the folder
            let a = await fetch(`/Songs/${folder}/info.json`);
            if (!a.ok) continue; 
            let response = await a.json();

            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="/svgFiles/play.svg">
                        </div>
                        <img src="/Songs/${folder}/cover.jpg">
                        <h4 class="hover">${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async items => {
            console.log("Fetching Songs")
            songs = await getSongs(`Songs/${items.currentTarget.dataset.folder}`)  
            playMusic(songs[0])
        })
    })

}

async function main() {

    // get the list of all songs
    await getSongs("Songs/ncs" )
    playMusic(songs[0], true)

    //  Display all the albums on the page
    await displayAlbum()

    //Attach an eventListner to play, next and previous
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play()
            play.src = "/svgFiles/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "/svgFiles/playbar.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an eventlistner to seek bar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100 ;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an eventlsitner for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    // Add an eventlsitner for close
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-110%"
    })

    // Add an eventlistner to previous 
    previous.addEventListener("click", ()=>{
        console.log("Previous clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })

    // Add an eventlistner to next 

    next.addEventListener("click", ()=>{
        currentSong.pause()
        console.log("Next clicked")
        
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    // Add an event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting value to: ", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //  Add event listner to mute a track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if(e.target.src.includes("/svgFiles/volume.svg")){
            e.target.src = e.target.src.replace("/svgFiles/volume.svg", "/svgFiles/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("/svgFiles/mute.svg", "/svgFiles/volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}

main() 
