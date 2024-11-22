export const TrackOpTypes = {
    GET: 'get',
    HAS: 'has',
    ITERATE: 'iterate'
}

export const TriggerOpTypes = {
    SET: 'set',
    ADD: 'add',
    DELETE: 'delete'
}

export const triggerTypeMap = {
    [TriggerOpTypes.SET]: [TrackOpTypes.GET],
    [TriggerOpTypes.ADD]: [TrackOpTypes.GET, TrackOpTypes.HAS, TrackOpTypes.ITERATE],
    [TriggerOpTypes.DELETE]: [TrackOpTypes.GET, TrackOpTypes.HAS, TrackOpTypes.ITERATE]
}