/*this is the js.com*/
const {Gio, GLib, St, Clutter, GObject, Shell, Gdk} = imports.gi;
const Main = imports.ui.main;
const Mainloop = imports.mainloop

let buttoninp, popup, loop;
let currtext = "";
let entmsg = "";
var index = 0;
var typeactive = false;
let typebox, msgwin;
var chattile;

let displaystr = "nothing happened";

const Me = imports.misc.extensionUtils.getCurrentExtension();

let usrname = Me.path.toString().substring(6,Me.path.toString().substring(6).indexOf('/')+6);

function init() {
    buttoninp = new btnclass();
    popup = new popper();
}

var btnclass = GObject.registerClass({
    GtypeName: "btnclass",
}, class btnclass extends St.Button {
    _init() {
        super._init({
            style_class: "panelStyle",
            reactive: true,
            track_hover: true
        });

        this.connect("clicked", this.onclick.bind(this));
    }

    onclick() {

        this.pop = new popper();
        this.big = new St.Button({
            style_class: 'bigblk',
            reactive: true,
            height: Main.layoutManager.primaryMonitor.height,
            width: Main.layoutManager.primaryMonitor.width 
        });
        Main.layoutManager.addChrome(this.big, {
            affectsInputRegion: true,
            affectsStruts: false,
            trackFullscreen: true,
        });
        Main.layoutManager.addChrome(this.pop, {
            affectsInputRegion: true,
            affectsStruts: false,
            trackFullscreen: true,
        });
        this.big.set_position(0, 0);
        let xpos = this.get_x();
        this.pop.set_position(xpos, 25);
        loop = Mainloop.timeout_add_seconds(15, readmsg); 
        this.big.connect('clicked', () => {
           // delmsg();
           Mainloop.source_remove(loop);
            currtext = "";
            typeactive = false;
            Main.layoutManager.removeChrome(this.big);
            Main.layoutManager.removeChrome(this.pop);
            this.pop.destroy();
        });
    }
});
async function delmsg() {
    let [ok, out, err, exit] = GLib.spawn_command_line_async(`python3 ${Me.path.toString()}/write_message.py ${usrname} "literally anything" d`);
} 

async function writemsg() {
    let [ok, out, err, exit] = GLib.spawn_command_line_async(`python3 ${Me.path.toString()}/write_message.py ${usrname} "${currtext}" w`);
} 

async function readmsg() {
    readm();
}


async function readm() {
    let [ok, out, err, exit] = GLib.spawn_command_line_sync(`python3 ${Me.path.toString()}/write_message.py ${usrname} "literally anything" r`);
    let data = JSON.parse(out.toString()).messages;
    var str = "";
    for (let i = 0; i < data.length; i++) {
        str += `${data[i].toString()} + \n`;
    }
    try{
    msgwin.set_text(str);
    } catch (err) {
        
    } 
}
var popper = GObject.registerClass({
    GtypeName: "popper",
}, class popper extends St.Widget{
    _init() {
        super._init({
            style_class: "popup",
            reactive: true,
            can_focus: true,
            layout_manager: new Clutter.BinLayout(),
            track_hover: true,
        });

        this.lay = new St.BoxLayout({
            vertical: true,
        })
        msgwin = new St.Label({
            style_class: "mesg",
        })
        typebox = new St.Button({
            style_class: "tpwin",
            label: "Send a Message",
            reactive: true,
        });
        /*
        let scr = new St.ScrollView({
            reactive: true,
            height: 550,
            width: 296,
        })
        */
        this.connect("destroy", this.ondestroy.bind(this));
        this.insert_child_at_index(this.lay, 0);
       // scr.set_child(msgwin);
        this.lay.insert_child_at_index(msgwin, 0);
        this.lay.insert_child_at_index(typebox,1);
        typebox.connect('clicked', this.ontypec.bind(this))
    }

    ondestroy() {
        global.stage.disconnect('key-press-event');
        typebox.destroy();
    }
    ontypec(h, b) {
        typeactive = true;
    }
    onclick() {

    }
});

var Typebox = GObject.registerClass({
    GtypeName: "Typebox",
}, class Typebox extends St.Button {
    _init() {
        super._init({
            style_class: "typer"
        });
    }
})

function enable() {

    currtext = "";
    index = 0;
    

    buttoninp.set_label("Gitchat");
    global.stage.connect('key-press-event', (event, event2) => {
        
        if (!typeactive) {
            return true;
        } else {
        let key = event;
        let k = event2.get_key_symbol();

        if (k == 65288) {
            if (index >= 0) {
            currtext = currtext.substring(0, index) + currtext.substring(index+1);
             index--;
         }
      } else if (k == 65361) {
           if (index >= 0) {
             index--;
           }
         } else if (k == 65363) {
         if (index < currtext.length){
             index++;
         }
     } else if (k == 65362) {
        index = 0;
      } else if (k == 65364) {
        index = currtext.length - 1;
      } else if (k == 65293) {
        if (currtext.length > 0) {
        writemsg();
        readmsg();
         currtext = "";
         index = 0;
        }
      } else if (k == 65289) {
        // do tab stuff
      } else if (k != 65505 && k != 65506) {
          currtext = currtext.substring(0, index+1) + String.fromCharCode(k) + currtext.substring(index+1);
          index++;
        }
        if (index <= 23) {
            typebox.set_label(currtext);
        } else {
            typebox.set_label(currtext.substring(index-23));
        }
         return true;
    }
     });

    Main.panel._leftBox.insert_child_at_index(buttoninp, 2);
}

function disable() {
    try{
    Main.removeChrome(buttoninp.big);
    Main.removeChrome(buttoninp.pop);
    } catch (error) {

    }
    Mainloop.source_remove(loop);

    Main.panel._leftBox.remove_child(buttoninp);
}