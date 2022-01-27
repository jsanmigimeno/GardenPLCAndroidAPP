import { fromUnixTime } from 'date-fns';

export const getDateText = (timestamp: number): string => {
    if (timestamp === 0xFFFFFFFF) return '--';

    const date    = fromUnixTime(timestamp);
    const mm      = intToPaddedStr(date.getMonth() + 1, 2);
    const dd      = intToPaddedStr(date.getDate(), 2);
    const yyyy    = intToPaddedStr(date.getFullYear(), 4);
    const hours   = intToPaddedStr(date.getHours(), 2);
    const minutes = intToPaddedStr(date.getMinutes(), 2);
    return `${dd}/${mm}/${yyyy} ${hours}:${minutes}`;
};

export const formatDuration = (duration: number, base = 'min'): string => {
    const hours   = Math.floor(duration / 60);
    const minutes = duration - hours*60;
    if (hours > 0) return `${intToPaddedStr(hours, 0)} ${base === 'min' ? 'h' : 'min'}  ${intToPaddedStr(minutes, 2)} ${base}`;
    else           return `${minutes.toFixed(0)} ${base}`;
};

export const intToPaddedStr = (val: number, padLength: number): string => val.toString().padStart(padLength, '0');

export const zonesIntToArray = (zonesInt: number): number[] => {
    const zonesArr: number[] = [];

    let i = 0;
    while (zonesInt !== 0) {
        // eslint-disable-next-line no-bitwise
        if ((1 & zonesInt) !== 0) zonesArr.push(i++);
        // eslint-disable-next-line no-bitwise
        zonesInt = zonesInt >> 1;
    }

    return zonesArr;
};

export const arrayToZonesInt = (zonesArr: number[]): number =>{
    let zonesInt = 0;
    // eslint-disable-next-line no-bitwise
    zonesArr.forEach(zoneIndex => zonesInt |= 1 << zoneIndex);
    return zonesInt;
};
