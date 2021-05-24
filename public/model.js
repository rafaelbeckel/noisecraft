/*
Nodes
=====

Each node has:
- a node type (string)
- node name (string)
- global id number (integer)
- params (list of values)




Actions
=======

Here is a tentative list of various types of actions that can be performed on the model:

create_node <type> <init_state> // Init state can be null if creating new node
delete_node <id>
connect <src_node> <out_port> <dst_node> <out_port>
disconnect <src_node> <out_port> <dst_node> <out_port>
move_node <id> <new_x> <new_y>

// Creating a module will cause the model to
// Move nodes inside the module
create_module <list_of_node_ids>
split_module <node_id>

// Copying and pasting actions are necessary
// Because we can modify the graph after copying
copy <list_of_node_ids>
paste <min_x> <min_y>

// Sent by the play/stop buttons
play 
stop

// Sent by the audio thread so the UI can reflect playback position 
set_play_pos <time>

// The model keeps an internal queue of events for undo/redo
undo
redo

// Actions to edit the contents of nodes
set_name <node_id> <name>
set_param <node_id> <param_name> <new_val>
send_audio_data <node_id> <float array> // To visualize audio data in the UI

We may also need to send a set_param from the audio thread to
set the current position of MonoSeqs, because this is dependent
on a clock input node.
*/

/** Prototypes/descriptors for each type of node */
export const nodeDescs =
{
    'Add': {
        ins: [
            { name: 'in0', default: 0 },
            { name: 'in1', default: 0 }
        ],
        outs: ['out'],
        params: [],
        descr: 'add input waveforms',
    },

    'ADSR': {
        ins: [
            { name: 'gate', default: 0 },
            { name: 'att', default: 0.02 },
            { name: 'dec', default: 0.1 },
            { name: 'sus', default: 0.2 },
            { name: 'rel', default: 0.1 }
        ],
        outs: ['out'],
        params: [],
        descr: 'ADSR envelope generator',
    },

    'AudioOut': {
        ins: [
            { name: 'left', default: 0 },
            { name: 'right', default: 0 }
        ],
        outs: [],
        params: [],
        descr: 'stereo sound output',
    },

    'Clock': {
        ins: [],
        outs: [''],
        params: [
            { name: 'value', default: 120 },
            { name: 'minVal', default: 60 },
            { name: 'maxVal', default: 240 },
            { name: 'controlNo', default: null },
        ],
        descr: 'MIDI clock signal source with tempo in BPM',
    },

    /*
    'ClockOut': {
        ins: [
            { name: 'clock', default: 0 }
        ],
        outs: [],
        params: [],
        descr: 'MIDI clock output',
    },
    */

    'Const': {
        ins: [],
        outs: [''],
        params: [
            { name: 'value', default: 0 },
        ],
        descr: 'editable constant value',
    },

    'Delay': {
        ins: [
            { name: 'in', default: 0 },
            { name: 'time', default: 0 }
        ],
        outs: ['out'],
        params: [],
        descr: 'delay line',
    },

    // Used during compilation, reads from a delay line
    'delay_read': {
        internal: true,
        ins: [
            { name: 'time', default: 0 }
        ],
        outs: ['out'],
        params: [],
    },

    // Used during compilation, writes to a delay line
    'delay_write': {
        internal: true,
        ins: [
            { name: 'in', default: 0 },
        ],
        outs: [],
        params: [],
    },

    'Distort': {
        ins: [
            { name: 'in', default: 0 },
            { name: 'amt', default: 0 }
        ],
        outs: ['out'],
        params: [],
        descr: 'overdrive-style distortion',
    },

    'Div': {
        ins: [
            { name: 'in0', default: 0 },
            { name: 'in1', default: 1 }
        ],
        outs: ['out'],
        params: [],
        descr: 'divide one input by another',
    },

    'Filter': {
        ins: [
            { name: 'in', default: 0 },
            { name: 'cutoff', default: 1 },
            { name: 'reso', default: 0 }
        ],
        outs: ['out'],
        params: [],
        descr: 'low-pass filter',
    },

    'Knob': {
        ins: [],
        outs: [''],
        params: [
            { name: 'value', default: 0 },
            { name: 'minVal', default: 0 },
            { name: 'maxVal', default: 1 },
            { name: 'controlNo', default: null },
        ],
        descr: 'parameter control knob',
    },

    'MidiIn': {
        ins: [],
        outs: ['freq', 'gate'],
        params: [],
        descr: 'MIDI note input (cv/gate)',
    },

    'MonoSeq': {
        ins: [
            { name: 'clock', default: 0 },
            { name: 'gateTime', default: 0.1 },
        ],
        outs: ['freq', 'gate'],
        params: [],
        descr: 'monophonic step sequencer',
    },

    'Mul': {
        ins: [
            { name: 'in0', default: 1 },
            { name: 'in1', default: 1 }
        ],
        outs: ['out'],
        params: [],
        descr: 'multiply input waveforms',
    },

    'Noise': {
        ins: [],
        outs: ['out'],
        params: [],
        descr: 'white noise source',
    },

    'Notes': {
        ins: [],
        outs: [],
        params: [],
        descr: 'text notes',
    },

    'Pulse': {
        ins: [
            { name: 'freq', default: 0 },
            { name: 'pw', default: 0.5 }
        ],
        outs: ['out'],
        params: [],
        descr: 'pulse/square oscillator',
    },

    'Saw': {
        ins: [
            { name: 'freq', default: 0 }
        ],
        outs: ['out'],
        params: [],
        descr: 'sawtooth oscillator',
    },

    'Scope': {
        ins: [
            { name: '', default: 0 }
        ],
        outs: [],
        params: [
            { name: 'minVal', default: -1 },
            { name: 'maxVal', default: 1 },
        ],
        descr: 'scope to plot incoming signals',
    },

    'Sine': {
        ins: [
            { name: 'freq', default: 0 },
            { name: 'sync', default: 0 },
        ],
        outs: ['out'],
        params: [
            { name: 'minVal', default: -1 },
            { name: 'maxVal', default: 1 }
        ],
        descr: 'sine wave oscillator',
    },

    'Slide': {
        ins: [
            { name: 'in', default: 0 },
            { name: 'rate', default: 1 },
        ],
        outs: ['out'],
        params: [],
        descr: 'simple slew-rate limiter using a running average',
    },

    'Sub': {
        ins: [
            { name: 'in0', default: 0 },
            { name: 'in1', default: 0 }
        ],
        outs: ['out'],
        params: [],
        descr: 'subtract input waveforms',
    },

    'Tri': {
        ins: [
            { name: 'freq', default: 0 }
        ],
        outs: ['out'],
        params: [],
        descr: 'triangle oscillator',
    },
};

/** Graph of nodes model, operates on internal state data */
export class Model
{
    constructor(state)
    {
        self.state = state;

        // Next node id to be allocated
        this.nextId = 0;

        // List of views subscribed to model updates
        self.views = [];
    }

    // Apply an action to the model
    apply(action)
    {

        switch (action.type)
        {


        }



    }





}