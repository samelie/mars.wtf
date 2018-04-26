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
            duration: 2,
            transitionDuration: 1,
            camera: {
                position: [0, 0, 0]
            },
            scale: 1,
            marsUniforms: {
                atmosphereIntensity: 0.4,
                fresnelBias: 0.03,
                fresnelAmp: 1.0
            },
            outUniforms: {
                atmosphereIntensity: .0
            }
        }, {
            duration: 2,
            transitionDuration: 1,
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
            duration: 2,
            transitionDuration: 1,
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
            duration: 2,
            transitionDuration: 1,
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
        { id: 'space', url: 'assets/intro/space2.jpg' },
        { id: 'nebula', url: 'assets/intro/nebula.jpg' },
        { id: 'diffuse', url: 'assets/intro/final.png' },
        { id: 'albedo', url: 'assets/intro/albedo.png' },
        { id: 'height', url: 'assets/intro/height.jpg' },
        { id: 'ao', url: 'assets/intro/ao.jpg' },

        { id: 'irr_posx', url: 'assets/intro/hdr/irr_posx.hdr', type: 'binary' },
        { id: 'irr_posy', url: 'assets/intro/hdr/irr_posy.hdr', type: 'binary' },
        { id: 'irr_posz', url: 'assets/intro/hdr/irr_posz.hdr', type: 'binary' },
        { id: 'irr_negx', url: 'assets/intro/hdr/irr_negx.hdr', type: 'binary' },
        { id: 'irr_negy', url: 'assets/intro/hdr/irr_negy.hdr', type: 'binary' },
        { id: 'irr_negz', url: 'assets/intro/hdr/irr_negz.hdr', type: 'binary' },
    ]
}, {
    id: 'crater',
    type: 'mars',
    camera: {
        //limit: [0.1, HALF_PI],
        start: {
            radius: 20,
            p: [0, 0, 0],
            rx: 0.1
        },
        animation: [{
            type: 'rotate',
            props: {
                duration: 1.2,
                delay: 0.4
            },
            value: 0.7
        }, {
            type: 'moveToMesh',
            id: 'everythingone',
            props: {
                duration: 4,
                delay: 1,
                y: 3,
                offset: -.5
            }
        }, {
            type: 'radius',
            props: {
                duration: 1.2,
                delay: .4,
                offset: -.5
            },
            value: 20
        }],
        end: []
    },
    views: {
        sky: {
            id: "horizon",
            radius: 2000
        },
        terrain: {
            id: "terrain_heightmap",
            movement: {
                reset: 128,
                offset: TERRAIN_MOVEMENT_OFFSET,
                start:-(TERRAIN_IMAGE_HEIGHT - 144),
                width: TERRAIN_IMAGE_WIDTH,
                height: TERRAIN_IMAGE_HEIGHT,
                verbose:false,
                verboseLeft:340,
            },
            mesh: {
                scale: 1,
                amp: 20,
                position: [0, -20, 0],
                height: TERRAIN_IMAGE_HEIGHT + TERRAIN_MOVEMENT_OFFSET, //image height
                width: TERRAIN_IMAGE_WIDTH, //image
                widthSegments: TERRAIN_IMAGE_WIDTH / 2,
                heightSegments: (TERRAIN_IMAGE_HEIGHT + TERRAIN_MOVEMENT_OFFSET) / 2,
                color: [1, 0.765557, 0.336057],
                heightmaps: ['heightmap1', 'heightmap2'],
                textures: ['ao1', 'ao2'],
                sides: {
                    left: {
                        movement:{
                            offset: 128,
                            width: 256,
                            height: 512,
                            verbose:false,
                            verboseHeight:false,
                            verboseAo:false,
                            verboseLeft:0,
                        },
                        position: [-376, -20, -64],
                        scale: 2,
                        amp: 10,
                        width: 256,
                        height: 640,
                        widthSegments: 16,
                        heightSegments: 32,
                        heightmaps: ['left_sides_height', 'right_sides_height'],
                        textures: ['left_sides_ao','right_sides_ao'],
                    },
                    right: {
                        movement:{
                            offset: 128,
                            width: 256,
                            height: 512,
                            verbose:false,
                            verboseHeight:false,
                            verboseAo:false,
                            verboseLeft:560,
                        },
                        position: [376, -20, -64],
                        scale: 2,
                        amp: 10,
                        width: 256,
                        height: 640,
                        widthSegments: 16,
                        heightSegments: 32,
                        heightmaps: ['right_sides_height', 'left_sides_height'],
                        textures: ['right_sides_ao', 'left_sides_ao'],
                    }
                },
                mountains: {
                    position: [0, -10, -128],
                    scale: 4,
                    amp: 60,
                    width: 512,
                    height: 512,
                    widthSegments: 64,
                    heightSegments: 64,
                    heightmaps: ['sides_heightmap'],
                    textures: ['sides_ao'],
                }
            },
            width: TERRAIN_IMAGE_WIDTH, //image
            height: TERRAIN_IMAGE_HEIGHT, //image height
        },
        sculptures: [{
                id: 'everythingone',
                url: 'assets/models/everything/everythingone_good_reduced.obj',
                type: 'binary',
                rotation: HALF_PI,
                position: [0, -20, 256],
                scale: SCALES.everythingone,
                textures: [{
                    id: 'everythingone_diffuse',
                }, {
                    id: 'everythingone_ao',
                }],
                maxYToScale: 4.5,
                minY:21,
                maxY:24,
                hotspots: [{
                    rotate: { value: 0 },
                    rx: { value: 0.1, limit: [0.1, HALF_PI] },
                    radius: { value: SCALES.everythingone * 8, limit: [2*SCALES.everythingone, 700] },
                    local: [0, -2, 0],
                }, {
                    rotate: { value: 3. },
                    rx: { value: -0.3, limit: [-0.3, HALF_PI] },
                    radius: { value: 2, limit: [2, 700] },
                    local: [0, 5, 0],
                }]
            },{
                id: 'everythingone2',
                url: 'assets/models/imotehp/imotehp_reduced.obj',
                type: 'binary',
                rotation: HALF_PI,
                position: [10, -20, 1800],
                scale: 8,
                textures: [{
                    id: 'imotehp_diffuse',
                }],
                maxYToScale: 4.5,
                minY:21,
                maxY:24,
                hotspots: [{
                    rotate: { value: 0 },
                    rx: { value: 0.1, limit: [0.1, HALF_PI] },
                    radius: { value: 8, limit: [2, 700] },
                    local: [0, 2, 0],
                }, {
                    rotate: { value: 3. },
                    rx: { value: -0.3, limit: [-0.3, HALF_PI] },
                    radius: { value: 2, limit: [2, 700] },
                    local: [0, 5, 0],
                }]
            }
            /*, {
                        id: 'everythingone2',
                        url: 'assets/imotehp/imotehp_reduced.obj',
                        type: 'binary',
                        position: [10, -0.55, 10],
                        scale: 1,
                        textures: [{
                            id: 'imotehp_diffuse',
                        }],
                        maxYToScale: 4.5,
                        hotspots: [{
                            local: [0, 2, 0],
                            rx: { limit: [0.1, HALF_PI] },
                            radius: { value: 8, limit: [2, 600] },
                        }, ]
                    }, {
                        id: 'gut1',
                        url: 'assets/gut1/gut1_reduced.obj',
                        type: 'binary',
                        position: [-20, 0, 17],
                        scale: 1,
                        textures: [{
                            id: 'gut1_diffuse',
                        }],
                        maxYToScale: 4.5,
                        hotspots: [{
                            local: [0, 2, 0],
                            rx: { limit: [0.1, HALF_PI] },
                            radius: { value: 20, limit: [10, 800] },
                        }, ]
                    }, {
                        id: 'bolders',
                        url: 'assets/bolders/bolders_reduced.obj',
                        type: 'binary',
                        position: [8, 0, 22],
                        scale: 1,
                        textures: [{
                            id: 'bolders_diffuse',
                        }],
                        maxYToScale: 4.5,
                        hotspots: [{
                            local: [0, 5, 0],
                            rx: { limit: [0.25, HALF_PI] },
                            radius: { value: 20, limit: [10, 800] },
                        }, ]
                    }*/
        ]
    },
    textures: [{
            id: 'imotehp_diffuse',
            url: 'assets/models/imotehp/imotehp.png'
        }, {
            id: 'everythingone_diffuse',
            url: 'assets/models/everything/everthangone2.png'
        }, {
            id: 'everythingone_ao',
            url: 'assets/models/everything/everthangone_ao.jpg'
        }, {
            id: 'terrain_norm',
            url: 'assets/terrain/whole_map_ao_s_NRM.png'
        }, {
            id: 'horizon',
            url: 'assets/terrain/night_horizon_1.jpg'
        }, {
            id: 'sides_heightmap',
            url: 'assets/terrain/sides_heightmap.jpg'
        }, {
            id: 'left_sides_ao',
            url: 'assets/terrain/sides/left_ao.jpg'
        }, {
            id: 'right_sides_ao',
            url: 'assets/terrain/sides/right_ao.jpg'
        }, {
            id: 'left_sides_height',
            url: 'assets/terrain/sides/left.jpg'
        }, {
            id: 'right_sides_height',
            url: 'assets/terrain/sides/right.jpg'
        }, {
            id: 'ao1',
            url: 'assets/terrain/1/ao1.jpg'
        }, {
            id: 'ao2',
            url: 'assets/terrain/2/ao2.jpg'
        }, {
            id: 'heightmap1',
            url: 'assets/terrain/1/heightmap1.jpg'
        }, {
            id: 'heightmap2',
            url: 'assets/terrain/2/heightmap2.jpg'
        }

        /*
        {
            id: 'bolders_diffuse',
            url: 'assets/models/bolders/bolders.png'
        }, {
            id: 'gut1_diffuse',
            url: 'assets/models/gut1/gut1.png'
        },
        */

        // { id: 'irr_posx', url: 'assets/loc3/irr_posx.hdr', type: 'binary' },
        // { id: 'irr_posy', url: 'assets/loc3/irr_posy.hdr', type: 'binary' },
        // { id: 'irr_posz', url: 'assets/loc3/irr_posz.hdr', type: 'binary' },
        // { id: 'irr_negx', url: 'assets/loc3/irr_negx.hdr', type: 'binary' },
        // { id: 'irr_negy', url: 'assets/loc3/irr_negy.hdr', type: 'binary' },
        // { id: 'irr_negz', url: 'assets/loc3/irr_negz.hdr', type: 'binary' },

        // { id: 'rad_posx', url: 'assets/loc3/rad_posx.hdr', type: 'binary' },
        // { id: 'rad_posy', url: 'assets/loc3/rad_posy.hdr', type: 'binary' },
        // { id: 'rad_posz', url: 'assets/loc3/rad_posz.hdr', type: 'binary' },
        // { id: 'rad_negx', url: 'assets/loc3/rad_negx.hdr', type: 'binary' },
        // { id: 'rad_negy', url: 'assets/loc3/rad_negy.hdr', type: 'binary' },
        // { id: 'rad_negz', url: 'assets/loc3/rad_negz.hdr', type: 'binary' }
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
