import _ from 'lodash'

const HALF_PI = Math.PI / 2

const MARS_COLORS = {
    darkColor: [151, 92, 54],
    baseColor: [204, 131, 88],
    lightColor: [237, 174, 126],
    fogColor: [155, 134, 144]
}

const TERRAIN_IMAGE_HEIGHT = 768
const TERRAIN_IMAGE_WIDTH = 256
const TERRAIN_MOVEMENT_OFFSET = 512

const SCALES = {
    everythingone:8
}

export { MARS_COLORS }

const D = [{
    id: 'intro',
    type: 'intro',
    scenes: [{
            duration: 8,
            transitionDuration: 4,
            camera: {
                position: [0, 0, 0]
            },
            scale: 1,
            marsUniforms: {
                atmosphereIntensity: 0.4,
                fresnelBias: 0.03,
                fresnelAmp: 1.0
            },
            animations:{
                outUniforms: {
                    atmosphereIntensity: 0.0
                }
            },
            outUniforms: {
                atmosphereIntensity: .0
            }
        }, {
            duration: 12,
            transitionDuration: 3,
            camera: {
                position: [0, -20, -30]
            },
            scale: 1,
            marsUniforms: {
                atmosphereIntensity: 0.4,
                fresnelBias: 0.05,
                fresnelAmp: 1.0
            },
            outUniforms: {
                atmosphereIntensity: .0
            }
        }, {
            camera: {
                position: [30, 0, -60]
            },
            scale: 1,
            duration: 12,
            transitionDuration: 2,
            marsUniforms: {
                atmosphereIntensity: 1.0,
                fresnelBias: 0.1,
                fresnelAmp: 0.98
            },
            outUniforms: {
                noiseAtmosphere: 1,
                atmosphereIntensity: .0
            }
        }, {
            animations: {
                moveTo: {
                    value: [30.5, 0, -100],
                    props: { duration: 2, delay: 2 }
                },
                outUniforms: {
                    atmosphereIntensity: 3.0
                }
            },
            camera: {
                position: [30, 0, -90]
            },
            scale: 1,
            duration: 6,
            transitionDuration: 2,
            shake: true,
            shakeIntensity: 0.2,
            marsUniforms: {
                atmosphereIntensity: 1.2,
                fresnelBias: 0.3,
                fresnelAmp: 0.6
            },
            outUniforms: {
                atmosphereIntensity: 1.0
            }
        }
        /*, {
                animations: {
                     moveTo: {
                        value: [0, 0, 0],
                        props: { duration: 0.3, delay: 2 }
                    },
                    rotate: { value: -HALF_PI, props: {duration: .2, delay: 2 } },
                    radiusTo: { value: 50, props: { duration: 1, delay: 2 } },
                },
                scale: 1,
                uniforms: {
                    fresnelIntensity: 1.4
                }
            }*/
    ],
    animation: [{
        getMoveTo: { value: [0, 0, 0], delay: 10 },
        rotate: { value: -HALF_PI, delay: 10 },
        radiusTo: { value: 50, delay: 10, limit: [15, 800] },
    }],
    textures: [
        { id: 'space', url: 'intro/space2.jpg' },
        { id: 'nebula', url: 'intro/nebula.jpg' },
        { id: 'diffuse', url: 'intro/final.png' },
        { id: 'albedo', url: 'intro/albedo.png' },
        { id: 'height', url: 'intro/height.jpg' },
        { id: 'ao', url: 'intro/ao.jpg' },

        { id: 'irr_posx', url: 'intro/hdr/irr_posx.hdr', type: 'binary' },
        { id: 'irr_posy', url: 'intro/hdr/irr_posy.hdr', type: 'binary' },
        { id: 'irr_posz', url: 'intro/hdr/irr_posz.hdr', type: 'binary' },
        { id: 'irr_negx', url: 'intro/hdr/irr_negx.hdr', type: 'binary' },
        { id: 'irr_negy', url: 'intro/hdr/irr_negy.hdr', type: 'binary' },
        { id: 'irr_negz', url: 'intro/hdr/irr_negz.hdr', type: 'binary' },
    ]
}]

export function findObjectsWithKey(D, key) {
    if (_.has(D, key)) // or just (key in obj)
        return [D];
    // elegant:
    return _.flattenDeep(_.map(D, function(v) {
        return typeof v == "object" ? findObjectsWithKey(v, key) : [];
    }), true);

    // or efficient:
    var res = [];
    _.forEach(D, function(v) {
        if (typeof v == "object" && (v = findObjectsWithKey(v, key)).length)
            res.push.apply(res, v);
    });
    return res;
}

export default D
