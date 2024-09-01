//!-- backend/controller/IconApi.js -->
import fetch from 'node-fetch';

//let data = []

async function getIconDatafromAPI(keyword) {
    console.log("Starting...");

    try {
        const searchResponse = await fetch(`https://api.iconify.design/search?query=${keyword}`);
        
        if (searchResponse.ok) {
            const searchJson = await searchResponse.json();
            const iconName = searchJson.icons[0];

            // SVG-Icon-Daten von der API abrufen
            const iconResponse = await fetch(`https://api.iconify.design/${iconName}.svg`);
            if (iconResponse.ok) {
                const iconSvg = await iconResponse.text();

                // Rückgabe von iconName und iconSvg als Objekt
                console.log("SVG data and icon name fetched and stored.");
                
                return { iconName, iconSvg };
            } else {
                console.error("Error fetching SVG icon.");
            }
        } else {
            console.error("Error fetching icon name.");
        }
    } catch (error) {
        console.error("Error during fetch operation:", error);
    }

    return null; // Falls ein Fehler auftritt, wird null zurückgegeben
}

export { getIconDatafromAPI };