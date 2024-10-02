//!-- backend/controller/MedApi.js -->

import fetch from 'node-fetch';
import jsdom from 'jsdom';

async function getMedfromAPI(keyword) {
    try {
        console.log('Received keyword:', keyword);

        const response = await fetch(`https://www.rxlist.com/api/drugchecker/drugchecker.svc/druglist/${keyword}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const responseData = await response.json();
        console.log('Response Data:', responseData);

        const firstMed = responseData[0];
        const medData = {
            id: firstMed.ID,
            title: firstMed.Name  
        };
        console.log('Extracted Data:', medData.id, medData.title);

        return medData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function compareMedfromAPI(itemId1, itemId2) {
    try {
        console.log('Verglichene Medikamente compareMedFromAPI :', itemId1, itemId2);

        const response = await fetch(`https://www.rxlist.com/api/drugchecker/drugchecker.svc/interactionlist/${itemId1}_${itemId2}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const responseData = await response.json();
        console.log('API response compareMedFromAPI :', responseData);

        return responseData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function compareWithExistingMedications(newMedId, existingMeds) {
    try {
        if (existingMeds.length <= 1) {
            console.log('No other medications found to compare with.');
            return [];
        }
    
        let comparisonResults = [];
        for (const med of existingMeds) {
            if (med.med_id !== newMedId) {
                const comparisonResult = await compareMedfromAPI(newMedId, med.med_id); // Korrekte IDs vergleichen
                console.log(`Comparison result between ${newMedId} and ${med.med_id}:`, comparisonResult);

                // Extrahiere die relevanten Details aus den Vergleichsergebnissen
                const interactionDetail = comparisonResult.DetailList && comparisonResult.DetailList[0] 
                    ? extractInteractionDetailsFromHTML(comparisonResult.DetailList[0]) 
                    : 'Keine Details gefunden';

                console.log('Extracted interaction detail:', interactionDetail);

                comparisonResults.push({ med_name: newMedId, existingMedId: med.med_name, interactionDetail });
            }
        }
    
        return comparisonResults;
    } catch (error) {
        console.error('Error comparing medications:', error);
        throw error;
    }
}


function extractInteractionDetailsFromHTML(htmlContent) {
    try {
        const { JSDOM } = jsdom;
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        const tab1_1 = document.querySelector('#tab-1-1');
        if (tab1_1) {
            const pElement = tab1_1.querySelector('p');
            if (pElement) {
                return pElement.textContent.trim();
            }
        }
        return 'Wechselwirkungen konnten nicht extrahiert werden';
    } catch (error) {
        console.error('Fehler beim Extrahieren der Interaktionsdetails:', error);
        throw error;
    }
}

export { getMedfromAPI, compareMedfromAPI, compareWithExistingMedications };
