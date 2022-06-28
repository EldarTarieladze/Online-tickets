import { Events } from 'src/models/event.model';
import { EVENTS_REPOSITORY } from '../../core/constants';

export const eventProviders = [{
    provide: EVENTS_REPOSITORY,
    useValue: Events,
}];