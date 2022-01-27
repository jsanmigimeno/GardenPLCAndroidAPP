import { SelectItem } from '../shared/select/select.component';

export const irrigationZoneOptions: SelectItem[] = [
    {value: 0, label: 'Zona 1'},
    {value: 1, label: 'Zona 2'},
    {value: 2, label: 'Zona 3'},
    // {value: 3, label: 'Zona 4'}
];

export const irrigationSourceOptions: SelectItem[] = [
    {value: 0, label: 'Red'},
    {value: 1, label: 'Piscina'}
];

export const irrigationPeriodOptions: SelectItem[] = [
    {value: 1,   label: '1 Hora'},
    {value: 2,   label: '2 Horas'},
    {value: 3,   label: '3 Horas'},
    {value: 4,   label: '4 Horas'},
    {value: 6,   label: '6 Horas'},
    {value: 8,   label: '8 Horas'},
    {value: 12,  label: '12 Horas'},
    {value: 24,  label: '1 Dia'},
    {value: 48,  label: '2 Dias'},
    {value: 72,  label: '3 Dias'},
    {value: 96,  label: '4 Dias'},
    {value: 120, label: '5 Dias'},
    {value: 144, label: '6 Dias'},
    {value: 168, label: '7 Dias'}
];
