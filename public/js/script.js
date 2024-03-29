let pixelation = 20; // Niveau initial de pixelisation.
let imgObj = null; // Variable pour stocker l'objet Image.

let currScore = 0;
let maxScore = 0;

function init_cookie()
{
    if(localStorage.getItem('cookie') == null)
    {
        maxScore = 0;
        localStorage.setItem('cookie',maxScore);
    }
    else
    {
        maxScore = localStorage.getItem('cookie');
    }
    const max_score = document.getElementById('maxscoreNB');
    max_score.innerHTML = maxScore;
    const score = document.getElementById('scoreNB');
    score.innerHTML = currScore;
    

}

async function random_film_image(json_file)
{
    try
    {
        const response = await fetch(json_file);
        const data = await response.json();

        const keys = Object.keys(data);
        const random_key = keys[Math.floor(Math.random() * keys.length)];
        const random_film = data[random_key];

        imgObj = new Image();
        imgObj.src = random_film.imageUrl;
        imgObj.onload = function () 
        {
            const canvas = document.getElementById('photo');
            const context = canvas.getContext('2d');

            canvas.width = 350;
            canvas.height = 525;

            context.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
            pixelate();
        };

        return random_film.displayName;
    }
    catch(err)
    {
        console.log(err);
    }
}




function pixelate() 
{
    const canvas = document.getElementById('photo');
    const context = canvas.getContext('2d');
    const size = 1 / pixelation;
    const w = canvas.width * size;
    const h = canvas.height * size;

    // Dessine l'image originale à une fraction de la taille finale.
    context.drawImage(canvas, 0, 0, w, h);

    // Désactive le lissage de l'image.
    context.msImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    // Agrandit l'image minimisée à la taille complète.
    context.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
}


async function fetchFilms()
{
    try 
    {
        const response = await fetch('films.json');
        const data = await response.json();
        const keys = Object.keys(data);

        const displayNames = keys.map(key => data[key].displayName);
        return displayNames;
    }
    catch(err)
    {
        console.log(err);
    }
    return [];
}

let FILMS_ARRAY = [];

fetchFilms().then(films => FILMS_ARRAY = films);

function guess_mode(guess)
{
   guess_input = document.getElementsByTagName('input')[0];

   if(guess_input.value != ""){
        if(guess_input.value === guess)
        {
            pixelation = 20;
            guess_input.value = "";
            skipButton.style.display = 'none'; // Cache le bouton pour skip de film
            const canvas = document.getElementById('photo');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
            canvas.classList.add('success');
            currScore += 1;
            update_score();
            update_max_score();

            return true;
        }
        else
        {
            pixelation -= 5;
            const canvas = document.getElementById('photo');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
            pixelate();
        }
    }
   guess_input.value = "";
   return false;

}




function autocomplete()
{
    const input = document.getElementById("guessinput");
    const ulresults = document.getElementById("infobulle");

    input.addEventListener('input',function() 
    {
        ulresults.innerHTML = "";
        const value = this.value;
        if(!value)
        {
            return;
        }
        
        const matches = FILMS_ARRAY.filter(film => film.toLowerCase().includes(value.toLowerCase()));


        if(matches.length===0)
        {
            return;
        }

        for(var i = 0; i<matches.length; ++i)
        {
            const li = document.createElement('li');
            li.innerText = matches[i];
            li.addEventListener('click',function()
            {
                input.value = this.innerText;
                ulresults.innerHTML = "";
            });
            ulresults.appendChild(li);
        
        }

    });

}

function update_score()
{
    const score = document.getElementById('scoreNB');
    score.innerHTML = currScore;
}

function update_max_score()
{
    if(currScore > maxScore)
    {
        maxScore = currScore;
        localStorage.setItem('cookie',maxScore);
        const max_score = document.getElementById('maxscoreNB');
        max_score.innerHTML = maxScore;
    }
}

document.addEventListener('DOMContentLoaded', async () => 
{
    init_cookie();
    var start = await random_film_image('films.json');
    const guess_button = document.getElementById('button');
    guess_button.addEventListener('click', async () => 
    {
        if(guess_mode(start))
        {
            setTimeout(async () =>
            {
                start = await random_film_image('films.json');
                const canvas = document.getElementById('photo');
                canvas.classList.remove('success');
            }, 400); 
        }
    });

    const depixelate_button = document.getElementById('depixelate');
    depixelate_button.addEventListener('click', function() 
    {
        if(pixelation > 1)
        {
            pixelation -= 5;
            const canvas = document.getElementById('photo');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
            pixelate();
        }
    });

    autocomplete();
});
