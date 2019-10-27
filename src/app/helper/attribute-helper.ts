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

        case 'qa':
            return { icon: attribute.toUpperCase(), description: attribute.toUpperCase() };

        case '12a':
        case '15':
        case 'u':
        case 'pg':
        case 'tbc':
        case 'ch':
            return undefined;

        default:
            return handleUnknownAttribute(attribute);
    }
}

function handleUnknownAttribute(attribute: never) {
    console.warn(`Unknown Attribute: ${attribute}`);
    return undefined;
}

