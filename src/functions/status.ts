import { Status } from '../types';

export function getStatusColor(status: Status): string {
    switch(status) {
        case 'active':
            return 'green';
        case 'inactive':
            return 'gray';
        case 'new':
            return 'blue';
        default:
            const exhaustiveCheck: never = status;
            return exhaustiveCheck;
    }
}
