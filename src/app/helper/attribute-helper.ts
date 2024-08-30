import { FilmAttribute } from 'src/contracts/contracts';

export function displayAttribute(attribute: FilmAttribute): { icon: string, description: string } | undefined {
    switch (attribute) {
        case '4dx':
        case '2d':
        case '3d':
            return { icon: attribute.toUpperCase(), description: attribute.toUpperCase() };

        case 'screenx':
            return { icon: 'X', description: 'ScreenX' };

        case 'superscreen':
            return { icon: 'S', description: 'Super Screen' };

        case 'alternative-content':
            return { icon: 'AC', description: 'Alternative Content' };

        case 'audio-described':
            return { icon: 'AD', description: 'Audio Described' };

        case 'subbed':
            return { icon: 'SU', description: 'Subtitled' };

        case 'movies-for-juniors':
            return { icon: 'J', description: 'Juniors' };

        case 'classicfilm':
            return { icon: "Cl", description: "Classic Film" };


        case 'action':
        case 'horror':
        case 'suspense':
        case 'animation':
        case 'adventure':
        case 'comedy':
        case 'drama':

        case 'tbc':
        case 'ch':        
        case 'qa':
        case '18':
        case '12a':
        case '15':
        case 'u':
        case 'pg':
        case 'reserved-selected':
            return undefined;

        default:
            return handleUnknownAttribute(attribute);
    }
}

function handleUnknownAttribute(_attribute: never) {
    return undefined;
}

