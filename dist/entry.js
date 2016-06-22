var Entry = {block:{}, TEXT_ALIGN_CENTER:0, TEXT_ALIGN_LEFT:1, TEXT_ALIGN_RIGHT:2, TEXT_ALIGNS:["center", "left", "right"], clipboard:null, loadProject:function(a) {
  a || (a = Entry.getStartProject(Entry.mediaFilePath));
  "workspace" == this.type && Entry.stateManager.startIgnore();
  Entry.projectId = a._id;
  Entry.variableContainer.setVariables(a.variables);
  Entry.variableContainer.setMessages(a.messages);
  Entry.scene.addScenes(a.scenes);
  Entry.stage.initObjectContainers();
  Entry.variableContainer.setFunctions(a.functions);
  Entry.container.setObjects(a.objects);
  Entry.FPS = a.speed ? a.speed : 60;
  createjs.Ticker.setFPS(Entry.FPS);
  "workspace" == this.type && Entry.stateManager.endIgnore();
  Entry.engine.projectTimer || Entry.variableContainer.generateTimer();
  0 === Object.keys(Entry.container.inputValue).length && Entry.variableContainer.generateAnswer();
  Entry.start();
  return a;
}, exportProject:function(a) {
  a || (a = {});
  Entry.engine.isState("stop") || Entry.engine.toggleStop();
  Entry.Func && Entry.Func.workspace && Entry.Func.workspace.visible && Entry.Func.cancelEdit();
  a.objects = Entry.container.toJSON();
  a.scenes = Entry.scene.toJSON();
  a.variables = Entry.variableContainer.getVariableJSON();
  a.messages = Entry.variableContainer.getMessageJSON();
  a.functions = Entry.variableContainer.getFunctionJSON();
  a.scenes = Entry.scene.toJSON();
  a.speed = Entry.FPS;
  return a;
}, setBlockByText:function(a, b) {
  a = [];
  b = jQuery.parseXML(b).getElementsByTagName("category");
  for (var d = 0;d < b.length;d++) {
    for (var c = b[d], e = {category:c.getAttribute("id"), blocks:[]}, c = c.childNodes, f = 0;f < c.length;f++) {
      var g = c[f];
      !g.tagName || "BLOCK" != g.tagName.toUpperCase() && "BTN" != g.tagName.toUpperCase() || e.blocks.push(g.getAttribute("type"));
    }
    a.push(e);
  }
  Entry.playground.setBlockMenu(a);
}, setBlock:function(a, b) {
  Entry.playground.setMenuBlock(a, b);
}, enableArduino:function() {
}, initSound:function(a) {
  a.path = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/" + a.filename + a.ext;
  Entry.soundQueue.loadFile({id:a.id, src:a.path, type:createjs.LoadQueue.SOUND});
}, beforeUnload:function(a) {
  Entry.hw.closeConnection();
  Entry.variableContainer.updateCloudVariables();
  if ("workspace" == Entry.type && (localStorage && Entry.interfaceState && localStorage.setItem("workspace-interface", JSON.stringify(Entry.interfaceState)), !Entry.stateManager.isSaved())) {
    return Lang.Workspace.project_changed;
  }
}, loadInterfaceState:function() {
  if ("workspace" == Entry.type) {
    if (localStorage && localStorage.getItem("workspace-interface")) {
      var a = localStorage.getItem("workspace-interface");
      this.resizeElement(JSON.parse(a));
    } else {
      this.resizeElement({menuWidth:280, canvasWidth:480});
    }
  }
}, resizeElement:function(a) {
  if ("workspace" == Entry.type) {
    var b = this.interfaceState;
    !a.canvasWidth && b.canvasWidth && (a.canvasWidth = b.canvasWidth);
    !a.menuWidth && this.interfaceState.menuWidth && (a.menuWidth = b.menuWidth);
    Entry.engine.speedPanelOn && Entry.engine.toggleSpeedPanel();
    (b = a.canvasWidth) ? 325 > b ? b = 325 : 720 < b && (b = 720) : b = 400;
    a.canvasWidth = b;
    var d = 9 * b / 16;
    Entry.engine.view_.style.width = b + "px";
    Entry.engine.view_.style.height = d + "px";
    Entry.engine.view_.style.top = "40px";
    Entry.stage.canvas.canvas.style.height = d + "px";
    Entry.stage.canvas.canvas.style.width = b + "px";
    400 <= b ? Entry.engine.view_.removeClass("collapsed") : Entry.engine.view_.addClass("collapsed");
    Entry.playground.view_.style.left = b + .5 + "px";
    Entry.propertyPanel.resize(b);
    var c = Entry.engine.view_.getElementsByClassName("entryAddButtonWorkspace_w")[0];
    c && (Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.width = .7 * b + "px") : c.style.display = "none");
    if (c = Entry.engine.view_.getElementsByClassName("entryRunButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.left = .7 * b + "px", c.style.width = .3 * b + "px") : (c.style.left = "2px", c.style.top = d + 24 + "px", c.style.width = b - 4 + "px");
    }
    if (c = Entry.engine.view_.getElementsByClassName("entryStopButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.left = .7 * b + "px", c.style.width = .3 * b + "px") : (c.style.left = "2px", c.style.top = d + 24 + "px", c.style.width = b + "px");
    }
    (b = a.menuWidth) ? 244 > b ? b = 244 : 400 < b && (b = 400) : b = 264;
    a.menuWidth = b;
    $(".blockMenuContainer").css({width:b - 64 + "px"});
    $(".blockMenuContainer>svg").css({width:b - 64 + "px"});
    Entry.playground.mainWorkspace.blockMenu.setWidth();
    $(".entryWorkspaceBoard").css({left:b + "px"});
    Entry.playground.resizeHandle_.style.left = b + "px";
    Entry.playground.variableViewWrapper_.style.width = b + "px";
    this.interfaceState = a;
  }
  Entry.windowResized.notify();
}, getUpTime:function() {
  return (new Date).getTime() - this.startTime;
}, addActivity:function(a) {
  Entry.stateManager && Entry.stateManager.addActivity(a);
}, startActivityLogging:function() {
  Entry.reporter && Entry.reporter.start(Entry.projectId, window.user ? window.user._id : null, Entry.startTime);
}, getActivityLog:function() {
  var a = {};
  Entry.stateManager && (a.activityLog = Entry.stateManager.activityLog_);
  return a;
}, DRAG_MODE_NONE:0, DRAG_MODE_MOUSEDOWN:1, DRAG_MODE_DRAG:2, cancelObjectEdit:function(a) {
  var b = Entry.playground.object;
  if (b) {
    var d = a.target;
    a = 0 !== $(b.view_).find(d).length;
    d = d.tagName.toUpperCase();
    !b.isEditing || "INPUT" === d && a || b.editObjectValues(!1);
  }
}};
window.Entry = Entry;
Entry.Albert = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, leftEye:0, rightEye:0, note:0, bodyLed:0, frontLed:0, padWidth:0, padHeight:0}, setZero:function() {
  var a = Entry.Albert.PORT_MAP, b = Entry.hw.sendQueue, d;
  for (d in a) {
    b[d] = a[d];
  }
  Entry.hw.update();
  a = Entry.Albert;
  a.tempo = 60;
  a.removeAllTimeouts();
}, monitorTemplate:{imgPath:"hw/albert.png", width:387, height:503, listPorts:{oid:{name:"OID", type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.ALBERT_sensor_leftProximity, type:"input", pos:{x:178, y:401}}, rightProximity:{name:Lang.Blocks.ALBERT_sensor_rightProximity, type:"input", pos:{x:66, y:359}}, battery:{name:Lang.Blocks.ALBERT_sensor_battery, type:"input", 
pos:{x:88, y:368}}, light:{name:Lang.Blocks.ALBERT_sensor_light, type:"input", pos:{x:127, y:391}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:299, y:406}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:22, y:325}}, leftEye:{name:Lang.Hw.leftEye, type:"output", pos:{x:260, y:26}}, rightEye:{name:Lang.Hw.rightEye, type:"output", pos:{x:164, y:13}}, bodyLed:{name:Lang.Hw.body + " " + Lang.Hw.led, type:"output", pos:{x:367, y:308}}, frontLed:{name:Lang.Hw.front + " " + Lang.Hw.led, 
pos:{x:117, y:410}}}, mode:"both"}, tempo:60, timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}, name:"albert"};
Blockly.Blocks.albert_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_hand_found = function(a, b) {
  a = Entry.hw.portData;
  return 40 < a.leftProximity || 40 < a.rightProximity;
};
Blockly.Blocks.albert_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_sensor_leftProximity, "leftProximity"], [Lang.Blocks.ALBERT_sensor_rightProximity, "rightProximity"], [Lang.Blocks.ALBERT_sensor_light, "light"], [Lang.Blocks.ALBERT_sensor_battery, "battery"], [Lang.Blocks.ALBERT_sensor_signalStrength, "signalStrength"], [Lang.Blocks.ALBERT_sensor_frontOid, "frontOid"], [Lang.Blocks.ALBERT_sensor_backOid, "backOid"], [Lang.Blocks.ALBERT_sensor_positionX, "positionX"], 
  [Lang.Blocks.ALBERT_sensor_positionY, "positionY"], [Lang.Blocks.ALBERT_sensor_orientation, "orientation"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.albert_value = function(a, b) {
  a = Entry.hw.portData;
  b = b.getField("DEVICE");
  return a[b];
};
Blockly.Blocks.albert_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = 30;
  a.rightWheel = 30;
  a = 1E3 * b.getNumberValue("VALUE");
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, a);
  Entry.Albert.timeouts.push(d);
  return b;
};
Blockly.Blocks.albert_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = -30;
  a.rightWheel = -30;
  a = 1E3 * b.getNumberValue("VALUE");
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, a);
  Entry.Albert.timeouts.push(d);
  return b;
};
Blockly.Blocks.albert_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  "LEFT" == b.getField("DIRECTION", b) ? (a.leftWheel = -30, a.rightWheel = 30) : (a.leftWheel = 30, a.rightWheel = -30);
  a = 1E3 * b.getNumberValue("VALUE");
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, a);
  Entry.Albert.timeouts.push(d);
  return b;
};
Blockly.Blocks.albert_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_both_wheels_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getNumberValue("LEFT"), c = b.getNumberValue("RIGHT");
  a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + d : d;
  a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + c : c;
  return b.callReturn();
};
Blockly.Blocks.albert_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_both_wheels_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.leftWheel = b.getNumberValue("LEFT");
  a.rightWheel = b.getNumberValue("RIGHT");
  return b.callReturn();
};
Blockly.Blocks.albert_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheel_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION"), c = b.getNumberValue("VALUE");
  "LEFT" == d ? a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + c : c : ("RIGHT" != d && (a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + c : c), a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + c : c);
  return b.callReturn();
};
Blockly.Blocks.albert_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheel_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION"), c = b.getNumberValue("VALUE");
  "LEFT" == d ? a.leftWheel = c : ("RIGHT" != d && (a.leftWheel = c), a.rightWheel = c);
  return b.callReturn();
};
Blockly.Blocks.albert_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_stop = function(a, b) {
  a = Entry.hw.sendQueue;
  a.leftWheel = 0;
  a.rightWheel = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_set_pad_size_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_1);
  this.appendValueInput("WIDTH").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_2);
  this.appendValueInput("HEIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_pad_size_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.padWidth = b.getNumberValue("WIDTH");
  a.padHeight = b.getNumberValue("HEIGHT");
  return b.callReturn();
};
Blockly.Blocks.albert_set_eye_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_eye_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_eye_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.ALBERT_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.ALBERT_color_magenta, "5"], [Lang.General.white, 
  "7"]]), "COLOR").appendField(Lang.Blocks.ALBERT_set_eye_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_eye_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION", b), c = Number(b.getField("COLOR", b));
  "LEFT" == d ? a.leftEye = c : ("RIGHT" != d && (a.leftEye = c), a.rightEye = c);
  return b.callReturn();
};
Blockly.Blocks.albert_clear_eye = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_eye_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_eye_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_eye = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION", b);
  "LEFT" == d ? a.leftEye = 0 : ("RIGHT" != d && (a.leftEye = 0), a.rightEye = 0);
  return b.callReturn();
};
Blockly.Blocks.albert_body_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_body_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.turn_on, "ON"], [Lang.General.turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_body_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_body_led = function(a, b) {
  a = Entry.hw.sendQueue;
  "ON" == b.getField("STATE", b) ? a.bodyLed = 1 : a.bodyLed = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_front_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_front_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.turn_on, "ON"], [Lang.General.turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_front_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_front_led = function(a, b) {
  a = Entry.hw.sendQueue;
  "ON" == b.getField("STATE", b) ? a.frontLed = 1 : a.frontLed = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_beep = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.buzzer = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.buzzer = 440;
  a.note = 0;
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, 200);
  Entry.Albert.timeouts.push(d);
  return b;
};
Blockly.Blocks.albert_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_buzzer_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getNumberValue("VALUE");
  a.buzzer = void 0 != a.buzzer ? a.buzzer + d : d;
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_buzzer_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.buzzer = b.getNumberValue("VALUE");
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_buzzer = function(a, b) {
  a = Entry.hw.sendQueue;
  a.buzzer = 0;
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.ALBERT_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.ALBERT_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_play_note_for = function(a, b) {
  var d = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    d.note = 0;
    return b.callReturn();
  }
  a = b.getNumberField("NOTE", b);
  var c = b.getNumberField("OCTAVE", b), e = 6E4 * b.getNumberValue("VALUE", b) / Entry.Albert.tempo;
  b.isStart = !0;
  b.timeFlag = 1;
  d.buzzer = 0;
  d.note = a + 12 * (c - 1);
  if (100 < e) {
    var f = setTimeout(function() {
      d.note = 0;
      Entry.Albert.removeTimeout(f);
    }, e - 100);
    Entry.Albert.timeouts.push(f);
  }
  var g = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(g);
  }, e);
  Entry.Albert.timeouts.push(g);
  return b;
};
Blockly.Blocks.albert_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_rest_for = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  var d = b.getNumberValue("VALUE"), d = 6E4 * d / Entry.Albert.tempo;
  a.buzzer = 0;
  a.note = 0;
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, d);
  Entry.Albert.timeouts.push(c);
  return b;
};
Blockly.Blocks.albert_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_tempo_by = function(a, b) {
  Entry.Albert.tempo += b.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return b.callReturn();
};
Blockly.Blocks.albert_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_tempo_to = function(a, b) {
  Entry.Albert.tempo = b.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return b.callReturn();
};
Blockly.Blocks.albert_move_forward = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = 30;
  a.rightWheel = 30;
  setTimeout(function() {
    b.timeFlag = 0;
  }, 1E3);
  return b;
};
Blockly.Blocks.albert_move_backward = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return a.leftWheel = -30, a.rightWheel = -30, b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  setTimeout(function() {
    b.timeFlag = 0;
  }, 1E3);
  return b;
};
Blockly.Blocks.albert_turn_around = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_around_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_around_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_around = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return a.leftWheel = b.leftValue, a.rightWheel = b.rightValue, b;
    }
    delete b.timeFlag;
    delete b.isStart;
    delete b.leftValue;
    delete b.rightValue;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  a = "LEFT" == b.getField("DIRECTION", b);
  b.leftValue = a ? -30 : 30;
  b.rightValue = a ? 30 : -30;
  b.isStart = !0;
  b.timeFlag = 1;
  setTimeout(function() {
    b.timeFlag = 0;
  }, 1E3);
  return b;
};
Blockly.Blocks.albert_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.General.skyblue, "3"], [Lang.General.blue, "1"], [Lang.General.purple, "5"], [Lang.General.white, "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_led_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION", b), c = Number(b.getField("COLOR", b));
  "FRONT" == d ? (a.leftEye = c, a.rightEye = c) : "LEFT" == d ? a.leftEye = c : a.rightEye = c;
  return b.callReturn();
};
Blockly.Blocks.albert_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_led = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION", b);
  "FRONT" == d ? (a.leftEye = 0, a.rightEye = 0) : "LEFT" == d ? a.leftEye = 0 : a.rightEye = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_change_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheels_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheels_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheels_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = Entry.hw.portData, c = b.getField("DIRECTION"), e = b.getNumberValue("VALUE");
  "LEFT" == c ? a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + e : d.leftWheel + e : ("RIGHT" != c && (a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + e : d.leftWheel + e), a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + e : d.rightWheel + e);
  return b.callReturn();
};
Blockly.Blocks.albert_set_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheels_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheels_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheels_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION"), c = b.getNumberValue("VALUE");
  "LEFT" == d ? a.leftWheel = c : ("RIGHT" != d && (a.leftWheel = c), a.rightWheel = c);
  return b.callReturn();
};
Entry.Arduino = {name:"arduino", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var a = 0;20 > a;a++) {
    Entry.hw.sendQueue[a] = 0, Entry.hw.sendQueue.readablePorts.push(a);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/arduino.png", width:605, height:434, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.SensorBoard = {name:"sensorBoard", setZero:Entry.Arduino.setZero};
Entry.dplay = {name:"dplay", vel_value:255, setZero:Entry.Arduino.setZero, timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}};
Entry.nemoino = {name:"nemoino", setZero:Entry.Arduino.setZero};
Entry.CODEino = {name:"CODEino", setZero:Entry.Arduino.setZero, monitorTemplate:Entry.Arduino.monitorTemplate};
Blockly.Blocks.arduino_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("Arduino"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_text = function(a, b) {
  return b.getStringField("NAME");
};
Blockly.Blocks.arduino_send = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_send = function(a, b) {
  a = b.getValue("VALUE", b);
  var d = new XMLHttpRequest;
  d.open("POST", "http://localhost:23518/arduino/", !1);
  d.send(String(a));
  Entry.assert(200 == d.status, "arduino is not connected");
  return b.callReturn();
};
Blockly.Blocks.arduino_get_string = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_2);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_number = function(a, b) {
  a = b.getValue("VALUE", b);
  b = new XMLHttpRequest;
  b.open("POST", "http://localhost:23518/arduino/", !1);
  b.send(String(a));
  Entry.assert(200 == b.status, "arduino is not connected");
  return Number(b.responseText);
};
Blockly.Blocks.arduino_get_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_string = function(a, b) {
  a = b.getValue("VALUE", b);
  b = new XMLHttpRequest;
  b.open("POST", "http://localhost:23518/arduino/", !1);
  b.send(String(a));
  Entry.assert(200 == b.status, "arduino is not connected");
  return b.responseText;
};
Blockly.Blocks.arduino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_arduino_get_sensor_number_0, "A0"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_1, "A1"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_2, "A2"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_3, "A3"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_4, "A4"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_5, "A5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_sensor_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.arduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_port_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.arduino_get_pwm_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_pwm_port_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.arduino_get_number_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.arduino_get_number_sensor_value = function(a, b) {
  a = b.getValue("VALUE", b);
  return Entry.hw.getAnalogPortValue(a[1]);
};
Blockly.Blocks.arduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.arduino_get_digital_value = function(a, b) {
  a = b.getNumberValue("VALUE", b);
  return Entry.hw.getDigitalPortValue(a);
};
Blockly.Blocks.arduino_toggle_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_led = function(a, b) {
  a = b.getNumberValue("VALUE");
  var d = b.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(a, "on" == d ? 255 : 0);
  return b.callReturn();
};
Blockly.Blocks.arduino_toggle_pwm = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_1);
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_3);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_pwm = function(a, b) {
  a = b.getNumberValue("PORT");
  var d = b.getNumberValue("VALUE"), d = Math.round(d), d = Math.max(d, 0), d = Math.min(d, 255);
  Entry.hw.setDigitalPortValue(a, d);
  return b.callReturn();
};
Blockly.Blocks.arduino_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_4);
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_6);
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_convert_scale = function(a, b) {
  var d = b.getNumberValue("VALUE1", b), c = b.getNumberValue("VALUE2", b), e = b.getNumberValue("VALUE3", b);
  a = b.getNumberValue("VALUE4", b);
  b = b.getNumberValue("VALUE5", b);
  if (c > e) {
    var f = c, c = e, e = f
  }
  a > b && (f = a, a = b, b = f);
  d = (b - a) / (e - c) * (d - c);
  d += a;
  d = Math.min(b, d);
  d = Math.max(a, d);
  return Math.round(d);
};
Blockly.Blocks.sensorBoard_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\uc18c\ub9ac", "0"], ["\ube5b \uac10\uc9c0", "1"], ["\uc2ac\ub77c\uc774\ub354", "2"], ["\uc628\ub3c4", "3"]]), "PORT").appendField(" \uc13c\uc11c\uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.sensorBoard_get_named_sensor_value = function(a, b) {
  return Entry.hw.getAnalogPortValue(b.getField("PORT", b));
};
Blockly.Blocks.sensorBoard_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "8"], ["\ud30c\ub780", "9"], ["\ub178\ub780", "10"], ["\ucd08\ub85d", "11"]]), "PORT");
  this.appendDummyInput().appendField(" \ubc84\ud2bc\uc744 \ub20c\ub800\ub294\uac00?");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.sensorBoard_is_button_pressed = function(a, b) {
  return Entry.hw.getDigitalPortValue(b.getNumberField("PORT", b));
};
Blockly.Blocks.sensorBoard_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "2"], ["\ucd08\ub85d", "3"], ["\ud30c\ub780", "4"], ["\ud770\uc0c9", "5"]]), "PORT").appendField(" LED").appendField(new Blockly.FieldDropdown([["\ucf1c\uae30", "255"], ["\ub044\uae30", "0"]]), "OPERATOR").appendField(" ").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.sensorBoard_led = function(a, b) {
  Entry.hw.setDigitalPortValue(b.getField("PORT"), b.getNumberField("OPERATOR"));
  return b.callReturn();
};
Entry.block.arduino_download_connector = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download connector");
}]}};
Entry.block.arduino_download_source = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5d4\ud2b8\ub9ac \uc544\ub450\uc774\ub178 \uc18c\uc2a4", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_connected = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ub428", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_reconnect = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub2e4\uc2dc \uc5f0\uacb0\ud558\uae30", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Blockly.Blocks.CODEino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_get_sensor_number_0, "A0"], [Lang.Blocks.CODEino_get_sensor_number_1, "A1"], [Lang.Blocks.CODEino_get_sensor_number_2, "A2"], [Lang.Blocks.CODEino_get_sensor_number_3, "A3"], [Lang.Blocks.CODEino_get_sensor_number_4, "A4"], [Lang.Blocks.CODEino_get_sensor_number_5, "A5"], [Lang.Blocks.CODEino_get_sensor_number_6, "A6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_sensor_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.CODEino_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_sensor_name_0, "0"], [Lang.Blocks.CODEino_sensor_name_1, "1"], [Lang.Blocks.CODEino_sensor_name_2, "2"], [Lang.Blocks.CODEino_sensor_name_3, "3"], [Lang.Blocks.CODEino_sensor_name_4, "4"], [Lang.Blocks.CODEino_sensor_name_5, "5"], [Lang.Blocks.CODEino_sensor_name_6, "6"]]), "PORT").appendField(Lang.Blocks.CODEino_string_1);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_named_sensor_value = function(a, b) {
  return Entry.hw.getAnalogPortValue(b.getField("PORT", b));
};
Blockly.Blocks.CODEino_get_sound_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_10).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_11, "GREAT"], [Lang.Blocks.CODEino_string_12, "SMALL"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_sound_status = function(a, b) {
  return "GREAT" == b.getField("STATUS", b) ? 600 < Entry.hw.getAnalogPortValue(0) ? 1 : 0 : 600 > Entry.hw.getAnalogPortValue(0) ? 1 : 0;
};
Blockly.Blocks.CODEino_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_13).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_14, "BRIGHT"], [Lang.Blocks.CODEino_string_15, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_light_status = function(a, b) {
  return "DARK" == b.getField("STATUS", b) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.CODEino_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_3, "4"], [Lang.Blocks.CODEino_string_4, "17"], [Lang.Blocks.CODEino_string_5, "18"], [Lang.Blocks.CODEino_string_6, "19"], [Lang.Blocks.CODEino_string_7, "20"]]), "PORT").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_is_button_pressed = function(a, b) {
  a = b.getNumberField("PORT", b);
  return 14 < a ? !Entry.hw.getAnalogPortValue(a - 14) : !Entry.hw.getDigitalPortValue(a);
};
Blockly.Blocks.CODEino_get_accelerometer_direction = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_16, "LEFT"], [Lang.Blocks.CODEino_string_17, "RIGHT"], [Lang.Blocks.CODEino_string_18, "FRONT"], [Lang.Blocks.CODEino_string_19, "REAR"], [Lang.Blocks.CODEino_string_20, "REVERSE"]]), "DIRECTION");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_accelerometer_direction = function(a, b) {
  a = b.getField("DIRECTION", b);
  b = 0;
  "LEFT" == a || "RIGHT" == a ? b = 3 : "FRONT" == a || "REAR" == a ? b = 4 : "REVERSE" == a && (b = 5);
  b = Entry.hw.getAnalogPortValue(b) - 265;
  b = Math.min(90, 180 / 137 * b + -90);
  b = Math.max(-90, b);
  b = Math.round(b);
  if ("LEFT" == a || "REAR" == a) {
    return -30 > b ? 1 : 0;
  }
  if ("RIGHT" == a || "FRONT" == a) {
    return 30 < b ? 1 : 0;
  }
  if ("REVERSE" == a) {
    return -50 > b ? 1 : 0;
  }
};
Blockly.Blocks.CODEino_get_accelerometer_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_accelerometer_X, "3"], [Lang.Blocks.CODEino_accelerometer_Y, "4"], [Lang.Blocks.CODEino_accelerometer_Z, "5"]]), "PORT").appendField(Lang.Blocks.CODEino_string_9);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_accelerometer_value = function(a, b) {
  var d = Entry.hw.getAnalogPortValue(b.getField("PORT", b)), c = 265, e = 402;
  a = -90;
  b = 90;
  if (c > e) {
    var f = c, c = e, e = f
  }
  a > b && (f = a, a = b, b = f);
  d = (b - a) / (e - c) * (d - c);
  d += a;
  d = Math.min(b, d);
  d = Math.max(a, d);
  return Math.round(d);
};
Blockly.Blocks.dplay_select_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_select_led = function(a, b) {
  var d = b.getField("PORT");
  a = 7;
  "7" == d ? a = 7 : "8" == d ? a = 8 : "9" == d ? a = 9 : "10" == d && (a = 10);
  d = b.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(a, "on" == d ? 255 : 0);
  return b.callReturn();
};
Blockly.Blocks.dplay_get_switch_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub514\uc9c0\ud138 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["4", "4"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_5, "ON"], [Lang.Blocks.dplay_string_6, "OFF"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_switch_status = function(a, b) {
  a = b.getField("PORT");
  var d = 2;
  "2" == a ? d = 2 : "4" == a && (d = 4);
  return "OFF" == b.getField("STATUS") ? 1 == Entry.hw.getDigitalPortValue(d) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(d) ? 1 : 0;
};
Blockly.Blocks.dplay_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_light).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_3, "BRIGHT"], [Lang.Blocks.dplay_string_4, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_light_status = function(a, b) {
  return "DARK" == b.getField("STATUS", b) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.dplay_get_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uac00\ubcc0\uc800\ud56d", "ADJU"], ["\ube5b\uc13c\uc11c", "LIGHT"], ["\uc628\ub3c4\uc13c\uc11c", "TEMP"], ["\uc870\uc774\uc2a4\ud2f1 X", "JOYS"], ["\uc870\uc774\uc2a4\ud2f1 Y", "JOYS"], ["\uc801\uc678\uc120", "INFR"]]), "OPERATOR");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_5);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.dplay_get_value = function(a, b) {
  a = b.getValue("VALUE", b);
  return Entry.hw.getAnalogPortValue(a[1]);
};
Blockly.Blocks.dplay_get_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_tilt).appendField(new Blockly.FieldDropdown([["\uc67c\ucabd \uae30\uc6b8\uc784", "LEFT"], ["\uc624\ub978\ucabd \uae30\uc6b8\uc784", "LIGHT"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_tilt = function(a, b) {
  return "LIGHT" == b.getField("STATUS", b) ? 1 == Entry.hw.getDigitalPortValue(12) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(12) ? 1 : 0;
};
Blockly.Blocks.dplay_DCmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc67c\ucabd", "3"], ["\uc624\ub978\ucabd", "6"]]), "PORT");
  this.appendDummyInput().appendField(" DC\ubaa8\ud130 \uc0c1\ud0dc\ub97c");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc815\ubc29\ud5a5", "FRONT"], ["\uc5ed\ubc29\ud5a5", "REAR"], ["\uc815\uc9c0", "OFF"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_DCmotor = function(a, b) {
  a = b.getField("PORT");
  var d = 0;
  "3" == a ? d = 5 : "6" == a && (d = 11);
  var c = b.getField("OPERATOR"), e = 0, f = 0;
  "FRONT" == c ? (e = 255, f = 0) : "REAR" == c ? (e = 0, f = 255) : "OFF" == c && (f = e = 0);
  Entry.hw.setDigitalPortValue(a, e);
  Entry.hw.setDigitalPortValue(d, f);
  return b.callReturn();
};
Blockly.Blocks.dplay_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubd80\uc800\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\ub3c4", "1"], ["\ub808", "2"], ["\ubbf8", "3"]]), "PORT");
  this.appendDummyInput().appendField("\ub85c");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc15\uc790\ub85c \uc5f0\uc8fc\ud558\uae30");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_buzzer = function(a, b) {
  var d = b.getField("PORT");
  a = 2;
  "1" == d ? a = 2 : "2" == d ? a = 4 : "3" == d && (a = 7);
  d = b.getNumberValue("VALUE");
  d = Math.round(d);
  d = Math.max(d, 0);
  d = Math.min(d, 100);
  Entry.hw.setDigitalPortValue(a, d);
  return b.callReturn();
};
Blockly.Blocks.dplay_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4\ubaa8\ud130 \uac01\ub3c4\ub97c");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc774\ub3d9");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_servo = function(a, b) {
  a = b.getNumberValue("VALUE");
  a = Math.round(a);
  a = Math.max(a, 0);
  a = Math.min(a, 180);
  Entry.hw.setDigitalPortValue(9, a);
  return b.callReturn();
};
Entry.Bitbrick = {SENSOR_MAP:{1:"light", 2:"IR", 3:"touch", 4:"potentiometer", 5:"MIC", 21:"UserSensor", 11:"UserInput", 20:"LED", 19:"SERVO", 18:"DC"}, PORT_MAP:{buzzer:2, 5:4, 6:6, 7:8, 8:10, LEDR:12, LEDG:14, LEDB:16}, sensorList:function() {
  for (var a = [], b = Entry.hw.portData, d = 1;5 > d;d++) {
    var c = b[d];
    c && (c.value || 0 === c.value) && a.push([d + " - " + Lang.Blocks["BITBRICK_" + c.type], d.toString()]);
  }
  return 0 == a.length ? [[Lang.Blocks.no_target, "null"]] : a;
}, touchList:function() {
  for (var a = [], b = Entry.hw.portData, d = 1;5 > d;d++) {
    var c = b[d];
    c && "touch" === c.type && a.push([d.toString(), d.toString()]);
  }
  return 0 == a.length ? [[Lang.Blocks.no_target, "null"]] : a;
}, servoList:function() {
  for (var a = [], b = Entry.hw.portData, d = 5;9 > d;d++) {
    var c = b[d];
    c && "SERVO" === c.type && a.push(["ABCD"[d - 5], d.toString()]);
  }
  return 0 == a.length ? [[Lang.Blocks.no_target, "null"]] : a;
}, dcList:function() {
  for (var a = [], b = Entry.hw.portData, d = 5;9 > d;d++) {
    var c = b[d];
    c && "DC" === c.type && a.push(["ABCD"[d - 5], d.toString()]);
  }
  return 0 == a.length ? [[Lang.Blocks.no_target, "null"]] : a;
}, setZero:function() {
  var a = Entry.hw.sendQueue, b;
  for (b in Entry.Bitbrick.PORT_MAP) {
    a[b] = 0;
  }
  Entry.hw.update();
}, name:"bitbrick", servoMaxValue:181, servoMinValue:1, dcMaxValue:100, dcMinValue:-100, monitorTemplate:{keys:["value"], imgPath:"hw/bitbrick.png", width:400, height:400, listPorts:{1:{name:Lang.Hw.port_en + " 1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, 
y:0}}, A:{name:Lang.Hw.port_en + " A " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, B:{name:Lang.Hw.port_en + " B " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, C:{name:Lang.Hw.port_en + " C " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, D:{name:Lang.Hw.port_en + " D " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Blockly.Blocks.bitbrick_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT").appendField(" \uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_sensor_value = function(a, b) {
  a = b.getStringField("PORT");
  return Entry.hw.portData[a].value;
};
Blockly.Blocks.bitbrick_is_touch_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.BITBRICK_touch).appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.touchList), "PORT").appendField("\uc774(\uac00) \ub20c\ub838\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_is_touch_pressed = function(a, b) {
  return 0 === Entry.hw.portData[b.getStringField("PORT")].value;
};
Blockly.Blocks.bitbrick_turn_off_color_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_color_led = function(a, b) {
  Entry.hw.sendQueue.LEDR = 0;
  Entry.hw.sendQueue.LEDG = 0;
  Entry.hw.sendQueue.LEDB = 0;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 R");
  this.appendValueInput("rValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("G");
  this.appendValueInput("gValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("B");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_rgb = function(a, b) {
  a = b.getNumberValue("rValue");
  var d = b.getNumberValue("gValue"), c = b.getNumberValue("bValue"), e = Entry.adjustValueWithMaxMin, f = Entry.hw.sendQueue;
  f.LEDR = e(a, 0, 255);
  f.LEDG = e(d, 0, 255);
  f.LEDB = e(c, 0, 255);
  return b.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \uc0c9 ").appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_picker = function(a, b) {
  a = b.getStringField("VALUE");
  Entry.hw.sendQueue.LEDR = parseInt(a.substr(1, 2), 16);
  Entry.hw.sendQueue.LEDG = parseInt(a.substr(3, 2), 16);
  Entry.hw.sendQueue.LEDB = parseInt(a.substr(5, 2), 16);
  return b.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 \uc0c9");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_value = function(a, b) {
  a = b.getNumberValue("VALUE");
  var d, c, e;
  a %= 200;
  67 > a ? (d = 200 - 3 * a, c = 3 * a, e = 0) : 134 > a ? (a -= 67, d = 0, c = 200 - 3 * a, e = 3 * a) : 201 > a && (a -= 134, d = 3 * a, c = 0, e = 200 - 3 * a);
  Entry.hw.sendQueue.LEDR = d;
  Entry.hw.sendQueue.LEDG = c;
  Entry.hw.sendQueue.LEDB = e;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\uc800\uc74c ");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_buzzer = function(a, b) {
  if (b.isStart) {
    return Entry.hw.sendQueue.buzzer = 0, delete b.isStart, b.callReturn();
  }
  a = b.getNumberValue("VALUE");
  Entry.hw.sendQueue.buzzer = a;
  b.isStart = !0;
  return b;
};
Blockly.Blocks.bitbrick_turn_off_all_motors = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ub4e0 \ubaa8\ud130 \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_all_motors = function(a, b) {
  var d = Entry.hw.sendQueue;
  a = Entry.Bitbrick;
  a.servoList().map(function(b) {
    d[b[1]] = 0;
  });
  a.dcList().map(function(b) {
    d[b[1]] = 128;
  });
  return b.callReturn();
};
Blockly.Blocks.bitbrick_dc_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" \uc18d\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_speed = function(a, b) {
  a = b.getNumberValue("VALUE");
  a = Math.min(a, Entry.Bitbrick.dcMaxValue);
  a = Math.max(a, Entry.Bitbrick.dcMinValue);
  Entry.hw.sendQueue[b.getStringField("PORT")] = a + 128;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_dc_direction_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.BITBRICK_dc_direction_cw, "CW"], [Lang.Blocks.BITBRICK_dc_direction_ccw, "CCW"]]), "DIRECTION").appendField(" \ubc29\ud5a5").appendField(" \uc18d\ub825");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_direction_speed = function(a, b) {
  a = "CW" === b.getStringField("DIRECTION");
  var d = b.getNumberValue("VALUE"), d = Math.min(d, Entry.Bitbrick.dcMaxValue), d = Math.max(d, 0);
  Entry.hw.sendQueue[b.getStringField("PORT")] = a ? d + 128 : 128 - d;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_servomotor_angle = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4 \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.servoList), "PORT").appendField(" \uac01\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_servomotor_angle = function(a, b) {
  a = b.getNumberValue("VALUE") + 1;
  a = Math.min(a, Entry.Bitbrick.servoMaxValue);
  a = Math.max(a, Entry.Bitbrick.servoMinValue);
  Entry.hw.sendQueue[b.getStringField("PORT")] = a;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubcc0\ud658");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT");
  this.appendDummyInput().appendField("\uac12");
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\uc5d0\uc11c");
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_convert_scale = function(a, b) {
  a = b.getNumberField("PORT");
  var d = Entry.hw.portData[a].value, c = b.getNumberValue("VALUE2", b), e = b.getNumberValue("VALUE3", b);
  a = b.getNumberValue("VALUE4", b);
  b = b.getNumberValue("VALUE5", b);
  if (a > b) {
    var f = a;
    a = b;
    b = f;
  }
  d = (b - a) / (e - c) * (d - c);
  d += a;
  d = Math.min(b, d);
  d = Math.max(a, d);
  return Math.round(d);
};
var categoryColor = "#FF9E20";
Blockly.Blocks.start_drawing = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_start_drawing).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.start_drawing()"]}};
Entry.block.start_drawing = function(a, b) {
  a.brush ? a.brush.stop = !1 : Entry.setBasicBrush(a);
  Entry.stage.sortZorder();
  a.brush.moveTo(a.getX(), -1 * a.getY());
  return b.callReturn();
};
Blockly.Blocks.stop_drawing = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_stop_drawing).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.stop_drawing()"]}};
Entry.block.stop_drawing = function(a, b) {
  a.brush && a.shape && (a.brush.stop = !0);
  return b.callReturn();
};
Blockly.Blocks.set_color = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_color_1);
  this.appendDummyInput().appendField(new Blockly.FieldColour("#ff0000"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_color_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_color(%1)"]}};
Entry.block.set_color = function(a, b) {
  var d = b.getField("VALUE", b);
  a.brush || (Entry.setBasicBrush(a), a.brush.stop = !0);
  a.brush && (d = Entry.hex2rgb(d), a.brush.rgb = d, a.brush.endStroke(), a.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + a.brush.opacity / 100 + ")"), a.brush.moveTo(a.getX(), -1 * a.getY()));
  return b.callReturn();
};
Blockly.Blocks.set_random_color = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_random_color).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_color_random()"]}};
Entry.block.set_random_color = function(a, b) {
  a.brush || (Entry.setBasicBrush(a), a.brush.stop = !0);
  if (a.brush) {
    var d = Entry.generateRgb();
    a.brush.rgb = d;
    a.brush.endStroke();
    a.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + a.brush.opacity / 100 + ")");
    a.brush.moveTo(a.getX(), -1 * a.getY());
  }
  return b.callReturn();
};
Blockly.Blocks.change_thickness = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_thickness_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_thickness_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_brush_thickness(%1)"]}};
Entry.block.change_thickness = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.brush || (Entry.setBasicBrush(a), a.brush.stop = !0);
  a.brush && (a.brush.thickness += d, 1 > a.brush.thickness && (a.brush.thickness = 1), a.brush.setStrokeStyle(a.brush.thickness), a.brush.moveTo(a.getX(), -1 * a.getY()));
  return b.callReturn();
};
Blockly.Blocks.set_thickness = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_thickness_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_thickness_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_thickness(%1)"]}};
Entry.block.set_thickness = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.brush || (Entry.setBasicBrush(a), a.brush.stop = !0);
  a.brush && (a.brush.thickness = d, a.brush.setStrokeStyle(a.brush.thickness), a.brush.moveTo(a.getX(), -1 * a.getY()));
  return b.callReturn();
};
Blockly.Blocks.change_opacity = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_opacity_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_opacity_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_brush_opacity(%1)"]}};
Entry.block.change_opacity = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.brush || (Entry.setBasicBrush(a), a.brush.stop = !0);
  d = Entry.adjustValueWithMaxMin(a.brush.opacity + d, 0, 100);
  a.brush && (a.brush.opacity = d, a.brush.endStroke(), d = a.brush.rgb, a.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + a.brush.opacity / 100 + ")"), a.brush.moveTo(a.getX(), -1 * a.getY()));
  return b.callReturn();
};
Blockly.Blocks.set_opacity = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_opacity_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_opacity_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_opacity(%1)"]}};
Entry.block.set_opacity = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.brush || (Entry.setBasicBrush(a), a.brush.stop = !0);
  a.brush && (a.brush.opacity = Entry.adjustValueWithMaxMin(d, 0, 100), a.brush.endStroke(), d = a.brush.rgb, a.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + a.brush.opacity / 100 + ")"), a.brush.moveTo(a.getX(), -1 * a.getY()));
  return b.callReturn();
};
Blockly.Blocks.brush_erase_all = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_brush_erase_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.erase_all_brush()"]}};
Entry.block.brush_erase_all = function(a, b) {
  var d = a.brush;
  if (d) {
    var c = d._stroke.style, e = d._strokeStyle.width;
    d.clear().setStrokeStyle(e).beginStroke(c);
    d.moveTo(a.getX(), -1 * a.getY());
  }
  a = a.parent.getStampEntities();
  a.map(function(b) {
    b.removeClone();
  });
  a = null;
  return b.callReturn();
};
Blockly.Blocks.brush_stamp = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_stamp).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.stamp()"]}};
Entry.block.brush_stamp = function(a, b) {
  a.parent.addStampEntity(a);
  return b.callReturn();
};
Blockly.Blocks.change_brush_transparency = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_brush_transparency_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_brush_transparency_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_brush_transparency_by_percent(%1)"]}};
Entry.block.change_brush_transparency = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.brush || (Entry.setBasicBrush(a), a.brush.stop = !0);
  d = Entry.adjustValueWithMaxMin(a.brush.opacity - d, 0, 100);
  a.brush && (a.brush.opacity = d, a.brush.endStroke(), d = a.brush.rgb, a.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + a.brush.opacity / 100 + ")"), a.brush.moveTo(a.getX(), -1 * a.getY()));
  return b.callReturn();
};
Blockly.Blocks.set_brush_tranparency = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_brush_transparency_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_brush_transparency_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_transparency_by_percent(%1)"]}};
Entry.block.set_brush_tranparency = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.brush || (Entry.setBasicBrush(a), a.brush.stop = !0);
  a.brush && (a.brush.opacity = Entry.adjustValueWithMaxMin(d, 0, 100), a.brush.endStroke(), d = a.brush.rgb, a.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + (1 - a.brush.opacity / 100) + ")"), a.brush.moveTo(a.getX(), -1 * a.getY()));
  return b.callReturn();
};
var calcArrowColor = "#e8b349", calcBlockColor = "#FFD974", calcFontColor = "#3D3D3D";
Blockly.Blocks.number = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "NUM");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["%1"]}};
Entry.block.number = function(a, b) {
  return b.getField("NUM", b);
};
Blockly.Blocks.angle = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldAngle("90"), "ANGLE");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:[" %1 "]}};
Entry.block.angle = function(a, b) {
  return b.getNumberField("ANGLE");
};
Blockly.Blocks.get_x_coordinate = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_x_coordinate, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_x()"]}};
Entry.block.get_x_coordinate = function(a, b) {
  return a.getX();
};
Blockly.Blocks.get_y_coordinate = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_y_coordinate, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_y()"]}};
Entry.block.get_y_coordinate = function(a, b) {
  return a.getY();
};
Blockly.Blocks.get_angle = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_angle, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_angle = function(a, b) {
  return parseFloat(a.getRotation().toFixed(1));
};
Blockly.Blocks.get_rotation_direction = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_rotation_value, "ROTATION"], [Lang.Blocks.CALC_direction_value, "DIRECTION"]], null, !0, calcArrowColor), "OPERATOR");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_direction()"]}};
Entry.block.get_rotation_direction = function(a, b) {
  return "DIRECTION" == b.getField("OPERATOR", b).toUpperCase() ? parseFloat(a.getDirection().toFixed(1)) : parseFloat(a.getRotation().toFixed(1));
};
Blockly.Blocks.distance_something = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_distance_something_1, calcFontColor).appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse", null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_distance_something_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_distance(%1)"]}};
Entry.block.distance_something = function(a, b) {
  b = b.getField("VALUE", b);
  if ("mouse" == b) {
    return b = Entry.stage.mouseCoordinate, Math.sqrt(Math.pow(a.getX() - b.x, 2) + Math.pow(a.getY() - b.y, 2));
  }
  b = Entry.container.getEntity(b);
  return Math.sqrt(Math.pow(a.getX() - b.getX(), 2) + Math.pow(a.getY() - b.getY(), 2));
};
Blockly.Blocks.coordinate_mouse = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_coordinate_mouse_1, calcFontColor).appendField(new Blockly.FieldDropdown([["x", "x"], ["y", "y"]], null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_coordinate_mouse_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.get_mouse_coordinate("%1")']}};
Entry.block.coordinate_mouse = function(a, b) {
  return "x" === b.getField("VALUE", b) ? Number(Entry.stage.mouseCoordinate.x) : Number(Entry.stage.mouseCoordinate.y);
};
Blockly.Blocks.coordinate_object = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_coordinate_object_1, calcFontColor).appendField(new Blockly.FieldDropdownDynamic("spritesWithSelf", null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_coordinate_object_2, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_coordinate_x_value, "x"], [Lang.Blocks.CALC_coordinate_y_value, "y"], [Lang.Blocks.CALC_coordinate_rotation_value, "rotation"], [Lang.Blocks.CALC_coordinate_direction_value, "direction"], 
  [Lang.Blocks.CALC_coordinate_size_value, "size"], [Lang.Blocks.CALC_picture_index, "picture_index"], [Lang.Blocks.CALC_picture_name, "picture_name"]], null, !0, calcArrowColor), "COORDINATE").appendField(Lang.Blocks.CALC_coordinate_object_3, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.get_object_coordinate("%1", "%2")']}};
Entry.block.coordinate_object = function(a, b) {
  var d = b.getField("VALUE", b);
  a = "self" == d ? a : Entry.container.getEntity(d);
  switch(b.getField("COORDINATE", b)) {
    case "x":
      return a.getX();
    case "y":
      return a.getY();
    case "rotation":
      return a.getRotation();
    case "direction":
      return a.getDirection();
    case "picture_index":
      return b = a.parent, b = b.pictures, b.indexOf(a.picture) + 1;
    case "size":
      return Number(a.getSize().toFixed(1));
    case "picture_name":
      return b = a.parent, b = b.pictures, b[b.indexOf(a.picture)].name;
  }
};
Blockly.Blocks.calc_basic = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([["+", "PLUS"], ["-", "MINUS"], ["x", "MULTI"], ["/", "DIVIDE"]], null, !1), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["%1 %2 %3"]}};
Entry.block.calc_basic = function(a, b) {
  a = b.getField("OPERATOR", b);
  var d = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return "PLUS" == a ? d + b : "MINUS" == a ? d - b : "MULTI" == a ? d * b : d / b;
};
Blockly.Blocks.calc_plus = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("+", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_plus = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return a + b;
};
Blockly.Blocks.calc_minus = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("-", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_minus = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return a - b;
};
Blockly.Blocks.calc_times = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("x", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_times = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return a * b;
};
Blockly.Blocks.calc_divide = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("/", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_divide = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return a / b;
};
Blockly.Blocks.calc_mod = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_mod_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_mod_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_mod_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_mod = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return a % b;
};
Blockly.Blocks.calc_share = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_share_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_share_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_share_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_share = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return Math.floor(a / b);
};
Blockly.Blocks.calc_operation = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_operation_of_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_operation_of_2, calcFontColor);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_calc_operation_square, "square"], [Lang.Blocks.CALC_calc_operation_root, "root"], [Lang.Blocks.CALC_calc_operation_sin, "sin"], [Lang.Blocks.CALC_calc_operation_cos, "cos"], [Lang.Blocks.CALC_calc_operation_tan, "tan"], [Lang.Blocks.CALC_calc_operation_asin, "asin_radian"], [Lang.Blocks.CALC_calc_operation_acos, "acos_radian"], [Lang.Blocks.CALC_calc_operation_atan, "atan_radian"], [Lang.Blocks.CALC_calc_operation_log, 
  "log"], [Lang.Blocks.CALC_calc_operation_ln, "ln"], [Lang.Blocks.CALC_calc_operation_unnatural, "unnatural"], [Lang.Blocks.CALC_calc_operation_floor, "floor"], [Lang.Blocks.CALC_calc_operation_ceil, "ceil"], [Lang.Blocks.CALC_calc_operation_round, "round"], [Lang.Blocks.CALC_calc_operation_factorial, "factorial"], [Lang.Blocks.CALC_calc_operation_abs, "abs"]], null, !0, calcArrowColor), "VALUE");
  this.setOutput(!0, "Number");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.calculate(%1, "%2")']}};
Entry.block.calc_operation = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getField("VALUE", b);
  if (-1 < ["asin_radian", "acos_radian"].indexOf(b) && (1 < a || -1 > a)) {
    throw Error("x range exceeded");
  }
  b.indexOf("_") && (b = b.split("_")[0]);
  -1 < ["sin", "cos", "tan"].indexOf(b) && (a = Entry.toRadian(a));
  switch(b) {
    case "square":
      b = a * a;
      break;
    case "factorial":
      b = Entry.factorial(a);
      break;
    case "root":
      b = Math.sqrt(a);
      break;
    case "log":
      b = Math.log(a) / Math.LN10;
      break;
    case "ln":
      b = Math.log(a);
      break;
    case "asin":
    ;
    case "acos":
    ;
    case "atan":
      b = Entry.toDegrees(Math[b](a));
      break;
    case "unnatural":
      b = a - Math.floor(a);
      0 > a && (b = 1 - b);
      break;
    default:
      b = Math[b](a);
  }
  return Math.round(1E3 * b) / 1E3;
};
Blockly.Blocks.calc_rand = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_rand_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_rand_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_rand_3, calcFontColor);
  this.setInputsInline(!0);
}, syntax:{js:[], py:["random.randrange(%1, %2)"]}};
Entry.block.calc_rand = function(a, b) {
  a = b.getStringValue("LEFTHAND", b);
  b = b.getStringValue("RIGHTHAND", b);
  var d = Math.min(a, b), c = Math.max(a, b);
  a = Entry.isFloat(a);
  return Entry.isFloat(b) || a ? (Math.random() * (c - d) + d).toFixed(2) : Math.floor(Math.random() * (c - d + 1) + d);
};
Blockly.Blocks.get_date = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_date_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_get_date_year, "YEAR"], [Lang.Blocks.CALC_get_date_month, "MONTH"], [Lang.Blocks.CALC_get_date_day, "DAY"], [Lang.Blocks.CALC_get_date_hour, "HOUR"], [Lang.Blocks.CALC_get_date_minute, "MINUTE"], [Lang.Blocks.CALC_get_date_second, "SECOND"]], null, !0, calcArrowColor), "VALUE");
  this.appendDummyInput().appendField(" ").appendField(Lang.Blocks.CALC_get_date_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.get_date_time("%1")']}};
Entry.block.get_date = function(a, b) {
  a = b.getField("VALUE", b);
  b = new Date;
  return "YEAR" == a ? b.getFullYear() : "MONTH" == a ? b.getMonth() + 1 : "DAY" == a ? b.getDate() : "HOUR" == a ? b.getHours() : "MINUTE" == a ? b.getMinutes() : b.getSeconds();
};
Blockly.Blocks.get_sound_duration = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_duration_1, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds", null, !0, calcArrowColor), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_duration_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_sound_duration(%1)"]}};
Entry.block.get_sound_duration = function(a, b) {
  b = b.getField("VALUE", b);
  a = a.parent.sounds;
  for (var d = 0;d < a.length;d++) {
    if (a[d].id == b) {
      return a[d].duration;
    }
  }
};
Blockly.Blocks.reset_project_timer = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_reset, calcFontColor);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(a) {
  Entry.engine && Entry.engine.hideProjectTimer(a);
}};
Entry.block.reset_project_timer = function(a, b) {
  Entry.engine.updateProjectTimer(0);
  return b.callReturn();
};
Blockly.Blocks.set_visible_project_timer = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_visible_1, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_timer_visible_show, "SHOW"], [Lang.Blocks.CALC_timer_visible_hide, "HIDE"]], null, !0, calcArrowColor), "ACTION");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_visible_2, calcFontColor).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/calc_01.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(a) {
  Entry.engine && Entry.engine.hideProjectTimer(a);
}, syntax:{js:[], py:['Entry.show_timer("%1")']}};
Entry.block.set_visible_project_timer = function(a, b) {
  a = b.getField("ACTION", b);
  var d = Entry.engine.projectTimer;
  "SHOW" == a ? d.setVisible(!0) : d.setVisible(!1);
  return b.callReturn();
};
Blockly.Blocks.timer_variable = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_timer_value, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.timer_variable = function(a, b) {
  return Entry.container.inputValue.getValue();
};
Blockly.Blocks.get_project_timer_value = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_timer_value, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(a) {
  Entry.engine && Entry.engine.hideProjectTimer(a);
}, syntax:{js:[], py:["Entry.get_timer_value()"]}};
Entry.block.get_project_timer_value = function(a, b) {
  return Entry.engine.projectTimer.getValue();
};
Blockly.Blocks.char_at = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_char_at_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_char_at_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_char_at_3, calcFontColor);
  this.setInputsInline(!0);
}, syntax:{js:[], py:['"%1"[%2]']}};
Entry.block.char_at = function(a, b) {
  a = b.getStringValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b) - 1;
  if (0 > b || b > a.length - 1) {
    throw Error();
  }
  return a[b];
};
Blockly.Blocks.length_of_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_length_of_string_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_length_of_string_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["len(%1)"]}};
Entry.block.length_of_string = function(a, b) {
  return b.getStringValue("STRING", b).length;
};
Blockly.Blocks.substring = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_substring_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_2, calcFontColor);
  this.appendValueInput("START").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_3, calcFontColor);
  this.appendValueInput("END").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_4, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['"%1"[%2:%3]']}};
Entry.block.substring = function(a, b) {
  a = b.getStringValue("STRING", b);
  var d = b.getNumberValue("START", b) - 1;
  b = b.getNumberValue("END", b) - 1;
  var c = a.length - 1;
  if (0 > d || 0 > b || d > c || b > c) {
    throw Error();
  }
  return a.substring(Math.min(d, b), Math.max(d, b) + 1);
};
Blockly.Blocks.replace_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_replace_string_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_2, calcFontColor);
  this.appendValueInput("OLD_WORD").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_3, calcFontColor);
  this.appendValueInput("NEW_WORD").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_4, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['"%1".replace("%2", "%3")']}};
Entry.block.replace_string = function(a, b) {
  return b.getStringValue("STRING", b).replace(new RegExp(b.getStringValue("OLD_WORD", b), "gm"), b.getStringValue("NEW_WORD", b));
};
Blockly.Blocks.change_string_case = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_2, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_change_string_case_sub_1, "toUpperCase"], [Lang.Blocks.CALC_change_string_case_sub_2, "toLowerCase"]], null, !0, calcArrowColor), "CASE");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_3, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.change_string_case("%1", "%2")']}};
Entry.block.change_string_case = function(a, b) {
  return b.getStringValue("STRING", b)[b.getField("CASE", b)]();
};
Blockly.Blocks.index_of_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_index_of_string_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_index_of_string_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_index_of_string_3, calcFontColor);
  this.setInputsInline(!0);
}, syntax:{js:[], py:['"%1".index(%2)']}};
Entry.block.index_of_string = function(a, b) {
  a = b.getStringValue("LEFTHAND", b);
  b = b.getStringValue("RIGHTHAND", b);
  b = a.indexOf(b);
  return -1 < b ? b + 1 : 0;
};
Blockly.Blocks.combine_something = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_1, calcFontColor);
  this.appendValueInput("VALUE1").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_2, calcFontColor);
  this.appendValueInput("VALUE2").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_3, calcFontColor);
  this.setInputsInline(!0);
  this.setOutput(!0, "String");
}, syntax:{js:[], py:['"%1".index(%2)']}};
Entry.block.combine_something = function(a, b) {
  a = b.getStringValue("VALUE1", b);
  b = b.getStringValue("VALUE2", b);
  return a + b;
};
Blockly.Blocks.get_sound_volume = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_volume, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_sound_volume()"]}};
Entry.block.get_sound_volume = function(a, b) {
  return 100 * createjs.Sound.getVolume();
};
Blockly.Blocks.quotient_and_mod = {init:function() {
  this.setColour(calcBlockColor);
  "ko" == Lang.type ? (this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_1, calcFontColor), this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_2, calcFontColor), this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_3, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_quotient_and_mod_sub_1, 
  "QUOTIENT"], [Lang.Blocks.CALC_quotient_and_mod_sub_2, "MOD"]], null, !0, calcArrowColor), "OPERATOR")) : "en" == Lang.type && (this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_quotient_and_mod_sub_1, "QUOTIENT"], [Lang.Blocks.CALC_quotient_and_mod_sub_2, "MOD"]], null, !0, calcArrowColor), "OPERATOR"), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_2, calcFontColor), this.appendValueInput("LEFTHAND").setCheck(["Number", 
  "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_3, calcFontColor), this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]));
  this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_4, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.get_quotient_remainder(%1, %2, "%3"']}};
Entry.block.quotient_and_mod = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  var d = b.getNumberValue("RIGHTHAND", b);
  if (isNaN(a) || isNaN(d)) {
    throw Error();
  }
  return "QUOTIENT" == b.getField("OPERATOR", b) ? Math.floor(a / d) : a % d;
};
Blockly.Blocks.choose_project_timer_action = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_choose_project_timer_action_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_choose_project_timer_action_sub_1, "START"], [Lang.Blocks.CALC_choose_project_timer_action_sub_2, "STOP"], [Lang.Blocks.CALC_choose_project_timer_action_sub_3, "RESET"]], null, !0, calcArrowColor), "ACTION").appendField(Lang.Blocks.CALC_choose_project_timer_action_2, calcFontColor).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/calc_01.png", 
  "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(a) {
  Entry.engine && Entry.engine.hideProjectTimer(a);
}, syntax:{js:[], py:['Entry.act_timer("%1")']}};
Entry.block.choose_project_timer_action = function(a, b) {
  a = b.getField("ACTION");
  var d = Entry.engine, c = d.projectTimer;
  "START" == a ? c.isInit ? c.isInit && c.isPaused && (c.pauseStart && (c.pausedTime += (new Date).getTime() - c.pauseStart), delete c.pauseStart, c.isPaused = !1) : d.startProjectTimer() : "STOP" == a ? c.isInit && !c.isPaused && (c.isPaused = !0, c.pauseStart = (new Date).getTime()) : "RESET" == a && c.isInit && (c.setValue(0), c.start = (new Date).getTime(), c.pausedTime = 0, delete c.pauseStart);
  return b.callReturn();
};
Blockly.Blocks.wait_second = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_second_1);
  this.appendValueInput("SECOND").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_second_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.wait_seconds(%1)"]}};
Entry.block.wait_second = function(a, b) {
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a = b.getNumberValue("SECOND", b);
  setTimeout(function() {
    b.timeFlag = 0;
  }, 60 / (Entry.FPS || 60) * a * 1E3);
  return b;
};
Blockly.Blocks.repeat_basic = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_basic_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_basic_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["for i in range(%1):\n$1"]}};
Entry.block.repeat_basic = function(a, b) {
  if (!b.isLooped) {
    b.isLooped = !0;
    a = b.getNumberValue("VALUE", b);
    if (0 > a) {
      throw Error(Lang.Blocks.FLOW_repeat_basic_errorMsg);
    }
    b.iterCount = Math.floor(a);
  }
  if (0 == b.iterCount || 0 > b.iterCount) {
    return delete b.isLooped, delete b.iterCount, b.callReturn();
  }
  b.iterCount--;
  return b.getStatement("DO", b);
};
Blockly.Blocks.repeat_inf = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_inf).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["while True:\n$1"]}};
Entry.block.repeat_inf = function(a, b) {
  b.isLooped = !0;
  return b.getStatement("DO");
};
Blockly.Blocks.stop_repeat = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_repeat).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["break"]}};
Entry.block.stop_repeat = function(a, b) {
  return this.executor.break();
};
Blockly.Blocks.wait_until_true = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_until_true_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_until_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.wait_for_true(%1)"]}};
Entry.block.wait_until_true = function(a, b) {
  return b.getBooleanValue("BOOL", b) ? b.callReturn() : b;
};
Blockly.Blocks._if = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW__if_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW__if_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("STACK");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["if %1:\n$1"]}};
Entry.block._if = function(a, b) {
  return b.isLooped ? (delete b.isLooped, b.callReturn()) : b.getBooleanValue("BOOL", b) ? (b.isLooped = !0, b.getStatement("STACK", b)) : b.callReturn();
};
Blockly.Blocks.if_else = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("STACK_IF");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_3);
  this.appendStatementInput("STACK_ELSE");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["if %1:\n$1\nelse:\n$2"]}};
Entry.block.if_else = function(a, b) {
  if (b.isLooped) {
    return delete b.isLooped, b.callReturn();
  }
  a = b.getBooleanValue("BOOL", b);
  b.isLooped = !0;
  return a ? b.getStatement("STACK_IF", b) : b.getStatement("STACK_ELSE", b);
};
Blockly.Blocks.create_clone = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_create_clone_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("clone"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_create_clone_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.create_clone(%1)"]}};
Entry.block.create_clone = function(a, b) {
  var d = b.getField("VALUE", b);
  b = b.callReturn();
  "self" == d ? a.parent.addCloneEntity(a.parent, a, null) : Entry.container.getObject(d).addCloneEntity(a.parent, null, null);
  return b;
};
Blockly.Blocks.delete_clone = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_delete_clone).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["self.remove_clone()"]}};
Entry.block.delete_clone = function(a, b) {
  if (!a.isClone) {
    return b.callReturn();
  }
  a.removeClone();
};
Blockly.Blocks.when_clone_start = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_clone.png", "*", "start")).appendField(Lang.Blocks.FLOW_when_clone_start);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_clone_create()"]}};
Entry.block.when_clone_start = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.stop_run = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_run).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_run = function(a, b) {
  return Entry.engine.toggleStop();
};
Blockly.Blocks.repeat_while_true = {init:function() {
  this.setColour("#498deb");
  "ko" == Lang.type ? (this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_1), this.appendValueInput("BOOL").setCheck("Boolean"), this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_repeat_while_true_until, "until"], [Lang.Blocks.FLOW_repeat_while_true_while, "while"]]), "OPTION").appendField(Lang.Blocks.FLOW_repeat_while_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"))) : (this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_1), 
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_repeat_while_true_until, "until"], [Lang.Blocks.FLOW_repeat_while_true_while, "while"]]), "OPTION"), this.appendValueInput("BOOL").setCheck("Boolean"), this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*")));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["particular block"]}};
Entry.block.repeat_while_true = function(a, b) {
  a = b.getBooleanValue("BOOL", b);
  "until" == b.getField("OPTION", b) && (a = !a);
  return (b.isLooped = a) ? b.getStatement("DO", b) : b.callReturn();
};
Blockly.Blocks.stop_object = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_object_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_stop_object_all, "all"], [Lang.Blocks.FLOW_stop_object_this_object, "thisOnly"], [Lang.Blocks.FLOW_stop_object_this_thread, "thisThread"], [Lang.Blocks.FLOW_stop_object_other_thread, "otherThread"]]), "TARGET");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_object_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.stop(%1)"]}};
Entry.block.stop_object = function(a, b) {
  b = b.getField("TARGET", b);
  var d = Entry.container;
  switch(b) {
    case "all":
      return d.clearRunningState(), this.die();
    case "thisOnly":
      return a.parent.script.clearExecutorsByEntity(a), this.die();
    case "thisThread":
      return this.die();
    case "otherThread":
      a.parent.script.clearExecutors(), a.parent.script.addExecutor(this.executor);
  }
};
Blockly.Blocks.restart_project = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_restart).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.restart()"]}};
Entry.block.restart_project = function(a, b) {
  Entry.engine.toggleStop();
  Entry.engine.toggleRun();
};
Blockly.Blocks.remove_all_clones = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_delete_clone_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.remove_all_clones()"]}};
Entry.block.remove_all_clones = function(a, b) {
  a = a.parent.getClonedEntities();
  a.map(function(b) {
    b.removeClone();
  });
  a = null;
  return b.callReturn();
};
Entry.block.functionAddButton = {skeleton:"basic_button", color:"#eee", isNotFor:["functionInit"], template:"%1", params:[{type:"Text", text:"\ud568\uc218 \ucd94\uac00", color:"#333", align:"center"}], events:{mousedown:[function() {
  Entry.variableContainer.createFunction();
}]}, syntax:{js:[], py:[]}};
Blockly.Blocks.function_field_label = {init:function() {
  this.setColour("#f9c535");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_explanation_1), "NAME");
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_label = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#f9c535", template:"%1%2", params:[{type:"TextInput", value:"\ud568\uc218"}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_field_string = {init:function() {
  this.setColour("#FFD974");
  this.appendValueInput("PARAM").setCheck(["String"]);
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_string = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#ffd974", template:"%1%2", params:[{type:"Block", accept:"stringMagnet", restore:!0}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_field_boolean = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("PARAM").setCheck(["Boolean"]);
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_boolean = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#aeb8ff", template:"%1%2", params:[{type:"Block", accept:"booleanMagnet", restore:!0}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_param_string = {init:function() {
  this.setEditable(!1);
  this.setColour("#FFD974");
  this.setOutput(!0, ["String", "Number"]);
  this.setInputsInline(!0);
}, domToMutation:function(a) {
  a.getElementsByTagName("field");
  this.hashId = a.getAttribute("hashid");
  (a = Entry.Func.targetFunc.stringHash[this.hashId]) || (a = "");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_character_variable + a), "");
}, mutationToDom:function() {
  var a = document.createElement("mutation");
  a.setAttribute("hashid", this.hashId);
  return a;
}};
Entry.block.function_param_string = function(a, b, d) {
  return b.register[b.hashId].run();
};
Entry.block.function_param_string = {skeleton:"basic_string_field", color:"#ffd974", template:"\ubb38\uc790/\uc22b\uc790\uac12", func:function() {
  return this.executor.register.params[this.executor.register.paramMap[this.block.type]];
}};
Blockly.Blocks.function_param_boolean = {init:function() {
  this.setEditable(!1);
  this.setColour("#AEB8FF");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, domToMutation:function(a) {
  a.getElementsByTagName("field");
  this.hashId = a.getAttribute("hashid");
  (a = Entry.Func.targetFunc.booleanHash[this.hashId]) || (a = "");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_logical_variable + a), "");
}, mutationToDom:function() {
  var a = document.createElement("mutation");
  a.setAttribute("hashid", this.hashId);
  return a;
}};
Entry.block.function_param_boolean = function(a, b, d) {
  return b.register[b.hashId].run();
};
Entry.block.function_param_boolean = {skeleton:"basic_boolean_field", color:"#aeb8ff", template:"\ud310\ub2e8\uac12", func:function() {
  return this.executor.register.params[this.executor.register.paramMap[this.block.type]];
}};
Blockly.Blocks.function_create = {init:function() {
  this.appendDummyInput().appendField(Lang.Blocks.FUNCTION_define);
  this.setColour("#cc7337");
  this.appendValueInput("FIELD").setCheck(["Param"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/function_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.function_create = function(a, b) {
  return b.callReturn();
};
Entry.block.function_create = {skeleton:"basic", color:"#cc7337", event:"funcDef", template:"\ud568\uc218 \uc815\uc758\ud558\uae30 %1 %2", params:[{type:"Block", accept:"paramMagnet", value:{type:"function_field_label"}}, {type:"Indicator", img:"/lib/entryjs/images/block_icon/function_03.png", size:12}], func:function() {
}};
Blockly.Blocks.function_general = {init:function() {
  this.setColour("#cc7337");
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, domToMutation:function(a) {
  var b = a.getElementsByTagName("field");
  this.appendDummyInput().appendField("");
  b.length || this.appendDummyInput().appendField(Lang.Blocks.FUNCTION_function);
  for (var d = 0;d < b.length;d++) {
    var c = b[d], e = c.getAttribute("hashid");
    switch(c.getAttribute("type").toLowerCase()) {
      case "label":
        this.appendDummyInput().appendField(c.getAttribute("content"));
        break;
      case "string":
        this.appendValueInput(e).setCheck(["String", "Number"]);
        break;
      case "boolean":
        this.appendValueInput(e).setCheck(["Boolean"]);
    }
  }
  this.hashId = a.getAttribute("hashid");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/function_03.png", "*"));
}, mutationToDom:function() {
  for (var a = document.createElement("mutation"), b = 1;b < this.inputList.length;b++) {
    var d = this.inputList[b];
    if (d.fieldRow[0] && d.fieldRow[0] instanceof Blockly.FieldLabel) {
      var d = d.fieldRow[0], c = document.createElement("field");
      c.setAttribute("type", "label");
      c.setAttribute("content", d.text_);
    } else {
      d.connection && "String" == d.connection.check_[0] ? (c = document.createElement("field"), c.setAttribute("type", "string"), c.setAttribute("hashid", d.name)) : d.connection && "Boolean" == d.connection.check_[0] && (c = document.createElement("field"), c.setAttribute("type", "boolean"), c.setAttribute("hashid", d.name));
    }
    a.appendChild(c);
  }
  a.setAttribute("hashid", this.hashId);
  return a;
}};
Entry.block.function_general = function(a, b) {
  if (!b.thread) {
    var d = Entry.variableContainer.getFunction(b.hashId);
    b.thread = new Entry.Script(a);
    b.thread.register = b.values;
    for (var c = 0;c < d.content.childNodes.length;c++) {
      "function_create" == d.content.childNodes[c].getAttribute("type") && b.thread.init(d.content.childNodes[c]);
    }
  }
  if (a = Entry.Engine.computeThread(a, b.thread)) {
    return b.thread = a, b;
  }
  delete b.thread;
  return b.callReturn();
};
Entry.block.function_general = {skeleton:"basic", color:"#cc7337", template:"\ud568\uc218", params:[], func:function(a) {
  if (!this.initiated) {
    this.initiated = !0;
    var b = Entry.variableContainer.getFunction(this.block.type.substr(5, 9));
    this.funcCode = b.content;
    this.funcExecutor = this.funcCode.raiseEvent("funcDef", a)[0];
    this.funcExecutor.register.params = this.getParams();
    this.funcExecutor.register.paramMap = b.paramMap;
  }
  this.funcExecutor.execute();
  if (!this.funcExecutor.isEnd()) {
    return this.funcCode.removeExecutor(this.funcExecutor), Entry.STATIC.BREAK;
  }
}};
Entry.Hamster = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, outputA:0, outputB:0, leftLed:0, rightLed:0, note:0, lineTracerMode:0, lineTracerModeId:0, lineTracerSpeed:5, ioModeA:0, ioModeB:0}, setZero:function() {
  var a = Entry.Hamster.PORT_MAP, b = Entry.hw.sendQueue, d;
  for (d in a) {
    b[d] = a[d];
  }
  Entry.hw.update();
  a = Entry.Hamster;
  a.lineTracerModeId = 0;
  a.lineTracerStateId = -1;
  a.tempo = 60;
  a.removeAllTimeouts();
}, lineTracerModeId:0, lineTracerStateId:-1, tempo:60, timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}, setLineTracerMode:function(a, b) {
  this.lineTracerModeId = this.lineTracerModeId + 1 & 255;
  a.lineTracerMode = b;
  a.lineTracerModeId = this.lineTracerModeId;
}, name:"hamster", monitorTemplate:{imgPath:"hw/hamster.png", width:256, height:256, listPorts:{temperature:{name:Lang.Blocks.HAMSTER_sensor_temperature, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.HAMSTER_sensor_accelerationX, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.HAMSTER_sensor_accelerationY, type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.HAMSTER_sensor_accelerationZ, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", 
pos:{x:0, y:0}}, note:{name:Lang.Hw.buzzer + "2", type:"output", pos:{x:0, y:0}}, outputA:{name:Lang.Hw.output + "A", type:"output", pos:{x:0, y:0}}, outputB:{name:Lang.Hw.output + "B", type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.HAMSTER_sensor_leftProximity, type:"input", pos:{x:122, y:156}}, rightProximity:{name:Lang.Blocks.HAMSTER_sensor_rightProximity, type:"input", pos:{x:10, y:108}}, leftFloor:{name:Lang.Blocks.HAMSTER_sensor_leftFloor, type:"input", pos:{x:100, 
y:234}}, rightFloor:{name:Lang.Blocks.HAMSTER_sensor_rightFloor, type:"input", pos:{x:13, y:180}}, lightsensor:{name:Lang.Hw.light + Lang.Hw.sensor, type:"input", pos:{x:56, y:189}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:209, y:115}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:98, y:30}}, leftLed:{name:Lang.Hw.left + " " + Lang.Hw.led, type:"output", pos:{x:87, y:210}}, rightLed:{name:Lang.Hw.right + " " + Lang.Hw.led, type:"output", pos:{x:24, y:168}}}, mode:"both"}};
Blockly.Blocks.hamster_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.hamster_hand_found = function(a, b) {
  a = Entry.hw.portData;
  return 50 < a.leftProximity || 50 < a.rightProximity;
};
Blockly.Blocks.hamster_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_sensor_leftProximity, "leftProximity"], [Lang.Blocks.HAMSTER_sensor_rightProximity, "rightProximity"], [Lang.Blocks.HAMSTER_sensor_leftFloor, "leftFloor"], [Lang.Blocks.HAMSTER_sensor_rightFloor, "rightFloor"], [Lang.Blocks.HAMSTER_sensor_accelerationX, "accelerationX"], [Lang.Blocks.HAMSTER_sensor_accelerationY, "accelerationY"], [Lang.Blocks.HAMSTER_sensor_accelerationZ, "accelerationZ"], [Lang.Blocks.HAMSTER_sensor_light, 
  "light"], [Lang.Blocks.HAMSTER_sensor_temperature, "temperature"], [Lang.Blocks.HAMSTER_sensor_signalStrength, "signalStrength"], [Lang.Blocks.HAMSTER_sensor_inputA, "inputA"], [Lang.Blocks.HAMSTER_sensor_inputB, "inputB"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.hamster_value = function(a, b) {
  a = Entry.hw.portData;
  b = b.getField("DEVICE");
  return a[b];
};
Blockly.Blocks.hamster_move_forward_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_once).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_once = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = Entry.hw.portData;
  if (b.isStart) {
    if (b.isMoving) {
      switch(b.boardState) {
        case 1:
          2 > b.count ? (50 > d.leftFloor && 50 > d.rightFloor ? b.count++ : b.count = 0, d = d.leftFloor - d.rightFloor, a.leftWheel = 45 + .25 * d, a.rightWheel = 45 - .25 * d) : (b.count = 0, b.boardState = 2);
          break;
        case 2:
          d = d.leftFloor - d.rightFloor;
          a.leftWheel = 45 + .25 * d;
          a.rightWheel = 45 - .25 * d;
          b.boardState = 3;
          var c = setTimeout(function() {
            b.boardState = 4;
            Entry.Hamster.removeTimeout(c);
          }, 250);
          Entry.Hamster.timeouts.push(c);
          break;
        case 3:
          d = d.leftFloor - d.rightFloor;
          a.leftWheel = 45 + .25 * d;
          a.rightWheel = 45 - .25 * d;
          break;
        case 4:
          a.leftWheel = 0, a.rightWheel = 0, b.boardState = 0, b.isMoving = !1;
      }
      return b;
    }
    delete b.isStart;
    delete b.isMoving;
    delete b.count;
    delete b.boardState;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.isMoving = !0;
  b.count = 0;
  b.boardState = 1;
  a.leftWheel = 45;
  a.rightWheel = 45;
  Entry.Hamster.setLineTracerMode(a, 0);
  return b;
};
Blockly.Blocks.hamster_turn_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_once_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_once_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_once = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = Entry.hw.portData;
  if (b.isStart) {
    if (b.isMoving) {
      if (b.isLeft) {
        switch(b.boardState) {
          case 1:
            2 > b.count ? 50 < d.leftFloor && b.count++ : (b.count = 0, b.boardState = 2);
            break;
          case 2:
            20 > d.leftFloor && (b.boardState = 3);
            break;
          case 3:
            2 > b.count ? 20 > d.leftFloor && b.count++ : (b.count = 0, b.boardState = 4);
            break;
          case 4:
            50 < d.leftFloor && (b.boardState = 5);
            break;
          case 5:
            d = d.leftFloor - d.rightFloor, -15 < d ? (a.leftWheel = 0, a.rightWheel = 0, b.boardState = 0, b.isMoving = !1) : (a.leftWheel = .5 * d, a.rightWheel = .5 * -d);
        }
      } else {
        switch(b.boardState) {
          case 1:
            2 > b.count ? 50 < d.rightFloor && b.count++ : (b.count = 0, b.boardState = 2);
            break;
          case 2:
            20 > d.rightFloor && (b.boardState = 3);
            break;
          case 3:
            2 > b.count ? 20 > d.rightFloor && b.count++ : (b.count = 0, b.boardState = 4);
            break;
          case 4:
            50 < d.rightFloor && (b.boardState = 5);
            break;
          case 5:
            d = d.rightFloor - d.leftFloor, -15 < d ? (a.leftWheel = 0, a.rightWheel = 0, b.boardState = 0, b.isMoving = !1) : (a.leftWheel = .5 * -d, a.rightWheel = .5 * d);
        }
      }
      return b;
    }
    delete b.isStart;
    delete b.isMoving;
    delete b.count;
    delete b.boardState;
    delete b.isLeft;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.isMoving = !0;
  b.count = 0;
  b.boardState = 1;
  "LEFT" == b.getField("DIRECTION", b) ? (b.isLeft = !0, a.leftWheel = -45, a.rightWheel = 45) : (b.isLeft = !1, a.leftWheel = 45, a.rightWheel = -45);
  Entry.Hamster.setLineTracerMode(a, 0);
  return b;
};
Blockly.Blocks.hamster_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = 30;
  a.rightWheel = 30;
  Entry.Hamster.setLineTracerMode(a, 0);
  a = 1E3 * b.getNumberValue("VALUE");
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, a);
  Entry.Hamster.timeouts.push(d);
  return b;
};
Blockly.Blocks.hamster_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_backward_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = -30;
  a.rightWheel = -30;
  Entry.Hamster.setLineTracerMode(a, 0);
  a = 1E3 * b.getNumberValue("VALUE");
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, a);
  Entry.Hamster.timeouts.push(d);
  return b;
};
Blockly.Blocks.hamster_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  "LEFT" == b.getField("DIRECTION", b) ? (a.leftWheel = -30, a.rightWheel = 30) : (a.leftWheel = 30, a.rightWheel = -30);
  Entry.Hamster.setLineTracerMode(a, 0);
  a = 1E3 * b.getNumberValue("VALUE");
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, a);
  Entry.Hamster.timeouts.push(d);
  return b;
};
Blockly.Blocks.hamster_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_both_wheels_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getNumberValue("LEFT"), c = b.getNumberValue("RIGHT");
  a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + d : d;
  a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + c : c;
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_both_wheels_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.leftWheel = b.getNumberValue("LEFT");
  a.rightWheel = b.getNumberValue("RIGHT");
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_wheel_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION"), c = b.getNumberValue("VALUE");
  "LEFT" == d ? a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + c : c : ("RIGHT" != d && (a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + c : c), a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + c : c);
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_wheel_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION"), c = b.getNumberValue("VALUE");
  "LEFT" == d ? a.leftWheel = c : ("RIGHT" != d && (a.leftWheel = c), a.rightWheel = c);
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_follow_line_using = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_using_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.General.white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_using_2).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_using_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_using = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("COLOR"), c = b.getField("DIRECTION"), e = 1;
  "RIGHT" == c ? e = 2 : "BOTH" == c && (e = 3);
  "WHITE" == d && (e += 7);
  a.leftWheel = 0;
  a.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(a, e);
  return b.callReturn();
};
Blockly.Blocks.hamster_follow_line_until = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_until_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.General.white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_until_2).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.Blocks.HAMSTER_front, "FRONT"], [Lang.Blocks.HAMSTER_rear, "REAR"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_until_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_until = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = Entry.hw.portData, c = b.getField("COLOR"), e = b.getField("DIRECTION"), f = 4;
  "RIGHT" == e ? f = 5 : "FRONT" == e ? f = 6 : "REAR" == e && (f = 7);
  "WHITE" == c && (f += 7);
  if (b.isStart) {
    if (c = Entry.Hamster, d.lineTracerStateId != c.lineTracerStateId && (c.lineTracerStateId = d.lineTracerStateId, 64 == d.lineTracerState)) {
      return delete b.isStart, Entry.engine.isContinue = !1, c.setLineTracerMode(a, 0), b.callReturn();
    }
  } else {
    b.isStart = !0, a.leftWheel = 0, a.rightWheel = 0, Entry.Hamster.setLineTracerMode(a, f);
  }
  return b;
};
Blockly.Blocks.hamster_set_following_speed_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_following_speed_to_1).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "SPEED").appendField(Lang.Blocks.HAMSTER_set_following_speed_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_following_speed_to = function(a, b) {
  Entry.hw.sendQueue.lineTracerSpeed = Number(b.getField("SPEED", b));
  return b.callReturn();
};
Blockly.Blocks.hamster_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_stop = function(a, b) {
  a = Entry.hw.sendQueue;
  a.leftWheel = 0;
  a.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.HAMSTER_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.HAMSTER_color_magenta, "5"], [Lang.General.white, 
  "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_led_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION", b), c = Number(b.getField("COLOR", b));
  "LEFT" == d ? a.leftLed = c : ("RIGHT" != d && (a.leftLed = c), a.rightLed = c);
  return b.callReturn();
};
Blockly.Blocks.hamster_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_led = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("DIRECTION", b);
  "LEFT" == d ? a.leftLed = 0 : ("RIGHT" != d && (a.leftLed = 0), a.rightLed = 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_beep = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.buzzer = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.buzzer = 440;
  a.note = 0;
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, 200);
  Entry.Hamster.timeouts.push(d);
  return b;
};
Blockly.Blocks.hamster_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_buzzer_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getNumberValue("VALUE");
  a.buzzer = void 0 != a.buzzer ? a.buzzer + d : d;
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.hamster_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_buzzer_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.buzzer = b.getNumberValue("VALUE");
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.hamster_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_buzzer = function(a, b) {
  a = Entry.hw.sendQueue;
  a.buzzer = 0;
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.hamster_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.HAMSTER_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_play_note_for = function(a, b) {
  var d = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    d.note = 0;
    return b.callReturn();
  }
  a = b.getNumberField("NOTE", b);
  var c = b.getNumberField("OCTAVE", b), e = 6E4 * b.getNumberValue("VALUE", b) / Entry.Hamster.tempo;
  b.isStart = !0;
  b.timeFlag = 1;
  d.buzzer = 0;
  d.note = a + 12 * (c - 1);
  if (100 < e) {
    var f = setTimeout(function() {
      d.note = 0;
      Entry.Hamster.removeTimeout(f);
    }, e - 100);
    Entry.Hamster.timeouts.push(f);
  }
  var g = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(g);
  }, e);
  Entry.Hamster.timeouts.push(g);
  return b;
};
Blockly.Blocks.hamster_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_rest_for = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  var d = b.getNumberValue("VALUE"), d = 6E4 * d / Entry.Hamster.tempo;
  a.buzzer = 0;
  a.note = 0;
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, d);
  Entry.Hamster.timeouts.push(c);
  return b;
};
Blockly.Blocks.hamster_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_tempo_by = function(a, b) {
  Entry.Hamster.tempo += b.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_tempo_to = function(a, b) {
  Entry.Hamster.tempo = b.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_port_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_port_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_port_to_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_analog_input, "0"], [Lang.Blocks.HAMSTER_digital_input, "1"], [Lang.Blocks.HAMSTER_servo_output, "8"], [Lang.Blocks.HAMSTER_pwm_output, "9"], [Lang.Blocks.HAMSTER_digital_output, 
  "10"]]), "MODE").appendField(Lang.Blocks.HAMSTER_set_port_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_port_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("PORT", b), c = Number(b.getField("MODE", b));
  "A" == d ? a.ioModeA = c : ("B" != d && (a.ioModeA = c), a.ioModeB = c);
  return b.callReturn();
};
Blockly.Blocks.hamster_change_output_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_change_output_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_output_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("PORT"), c = b.getNumberValue("VALUE");
  "A" == d ? a.outputA = void 0 != a.outputA ? a.outputA + c : c : ("B" != d && (a.outputA = void 0 != a.outputA ? a.outputA + c : c), a.outputB = void 0 != a.outputB ? a.outputB + c : c);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_output_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_output_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_output_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getField("PORT"), c = b.getNumberValue("VALUE");
  "A" == d ? a.outputA = c : ("B" != d && (a.outputA = c), a.outputB = c);
  return b.callReturn();
};
Blockly.Blocks.is_clicked = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_is_clicked, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.is_mouse_clicked()"]}};
Entry.block.is_clicked = function(a, b) {
  return Entry.stage.isClick;
};
Blockly.Blocks.is_press_some_key = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_is_press_some_key_1, "#3D3D3D");
  this.appendDummyInput().appendField(new Blockly.FieldKeydownInput("81"), "VALUE").appendField(Lang.Blocks.JUDGEMENT_is_press_some_key_2, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.is_particular_key_pressed(%1)"]}};
Entry.block.is_press_some_key = function(a, b) {
  a = Number(b.getField("VALUE", b));
  return 0 <= Entry.pressedKeys.indexOf(a);
};
Blockly.Blocks.reach_something = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_reach_something_1, "#3D3D3D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("collision"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_reach_something_2, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.is_reached_at(%2)"]}};
Entry.block.reach_something = function(a, b) {
  if (!a.getVisible()) {
    return !1;
  }
  var d = b.getField("VALUE", b);
  b = a.object;
  var c = /wall/.test(d), e = ndgmr.checkPixelCollision;
  if (c) {
    switch(a = Entry.stage.wall, d) {
      case "wall":
        if (e(b, a.up, .2, !0) || e(b, a.down, .2, !0) || e(b, a.left, .2, !0) || e(b, a.right, .2, !0)) {
          return !0;
        }
        break;
      case "wall_up":
        if (e(b, a.up, .2, !0)) {
          return !0;
        }
        break;
      case "wall_down":
        if (e(b, a.down, .2, !0)) {
          return !0;
        }
        break;
      case "wall_right":
        if (e(b, a.right, .2, !0)) {
          return !0;
        }
        break;
      case "wall_left":
        if (e(b, a.left, .2, !0)) {
          return !0;
        }
      ;
    }
  } else {
    if ("mouse" == d) {
      return e = Entry.stage.canvas, e = b.globalToLocal(e.mouseX, e.mouseY), b.hitTest(e.x, e.y);
    }
    d = Entry.container.getEntity(d);
    if ("textBox" == d.type || "textBox" == a.type) {
      e = d.object.getTransformedBounds();
      b = b.getTransformedBounds();
      if (Entry.checkCollisionRect(b, e)) {
        return !0;
      }
      a = d.parent.clonedEntities;
      d = 0;
      for (c = a.length;d < c;d++) {
        var f = a[d];
        if (!f.isStamp && f.getVisible() && Entry.checkCollisionRect(b, f.object.getTransformedBounds())) {
          return !0;
        }
      }
    } else {
      if (d.getVisible() && e(b, d.object, .2, !0)) {
        return !0;
      }
      a = d.parent.clonedEntities;
      d = 0;
      for (c = a.length;d < c;d++) {
        if (f = a[d], !f.isStamp && f.getVisible() && e(b, f.object, .2, !0)) {
          return !0;
        }
      }
    }
  }
  return !1;
};
Blockly.Blocks.boolean_comparison = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["=", "EQUAL"], ["<", "SMALLER"], [">", "BIGGER"]]), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["String", "Number"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_comparison = function(a, b) {
  a = b.getField("OPERATOR", b);
  var d = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return "EQUAL" == a ? d == b : "BIGGER" == a ? d > b : d < b;
};
Blockly.Blocks.boolean_equal = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField("=", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["String", "Number"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_equal = function(a, b) {
  a = b.getStringValue("LEFTHAND", b);
  b = b.getStringValue("RIGHTHAND", b);
  return a == b;
};
Blockly.Blocks.boolean_bigger = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(">", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_bigger = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return a > b;
};
Blockly.Blocks.boolean_smaller = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("<", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_smaller = function(a, b) {
  a = b.getNumberValue("LEFTHAND", b);
  b = b.getNumberValue("RIGHTHAND", b);
  return a < b;
};
Blockly.Blocks.boolean_and_or = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.JUDGEMENT_boolean_and, "AND"], [Lang.Blocks.JUDGEMENT_boolean_or, "OR"]]), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["%1 or %2"]}};
Entry.block.boolean_and_or = function(a, b) {
  a = b.getField("OPERATOR", b);
  var d = b.getBooleanValue("LEFTHAND", b);
  b = b.getBooleanValue("RIGHTHAND", b);
  return "AND" == a ? d && b : d || b;
};
Blockly.Blocks.boolean_and = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_and, "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["%1 && %3"]}};
Entry.block.boolean_and = function(a, b) {
  a = b.getBooleanValue("LEFTHAND", b);
  b = b.getBooleanValue("RIGHTHAND", b);
  return a && b;
};
Blockly.Blocks.boolean_or = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_or, "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["%1 || %3"]}};
Entry.block.boolean_or = function(a, b) {
  a = b.getBooleanValue("LEFTHAND", b);
  b = b.getBooleanValue("RIGHTHAND", b);
  return a || b;
};
Blockly.Blocks.boolean_not = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_not_1, "#3D3D3D");
  this.appendValueInput("VALUE").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_not_2, "#3D3D3D");
  this.appendDummyInput();
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["!%2"]}};
Entry.block.boolean_not = function(a, b) {
  return !b.getBooleanValue("VALUE");
};
Blockly.Blocks.true_or_false = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.JUDGEMENT_true, "true"], [Lang.Blocks.JUDGEMENT_false, "false"]]), "VALUE");
  this.appendDummyInput();
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.true_or_false = function(a, b) {
  return "true" == b.children[0].textContent;
};
Blockly.Blocks.True = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_true, "#3D3D3D").appendField(" ");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["True"]}};
Entry.block.True = function(a, b) {
  return !0;
};
Blockly.Blocks.False = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_false, "#3D3D3D").appendField(" ");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["false"]}};
Entry.block.False = function(a, b) {
  return !1;
};
Blockly.Blocks.boolean_basic_operator = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([["=", "EQUAL"], [">", "GREATER"], ["<", "LESS"], ["\u2265", "GREATER_OR_EQUAL"], ["\u2264", "LESS_OR_EQUAL"]], null, !1), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["%1 %2 %3"]}};
Entry.block.boolean_basic_operator = function(a, b) {
  a = b.getField("OPERATOR", b);
  var d = b.getStringValue("LEFTHAND", b);
  b = b.getStringValue("RIGHTHAND", b);
  switch(a) {
    case "EQUAL":
      return d == b;
    case "GREATER":
      return Number(d) > Number(b);
    case "LESS":
      return Number(d) < Number(b);
    case "GREATER_OR_EQUAL":
      return Number(d) >= Number(b);
    case "LESS_OR_EQUAL":
      return Number(d) <= Number(b);
  }
};
Blockly.Blocks.show = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_show).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.show()"]}};
Entry.block.show = function(a, b) {
  a.setVisible(!0);
  return b.callReturn();
};
Blockly.Blocks.hide = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_hide).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.hide()"]}};
Entry.block.hide = function(a, b) {
  a.setVisible(!1);
  return b.callReturn();
};
Blockly.Blocks.dialog_time = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.speak, "speak"]]), "OPTION");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.dialog_for_seconds(%1, %2, %3)"]}};
Entry.block.dialog_time = function(a, b) {
  if (!b.isStart) {
    var d = b.getNumberValue("SECOND", b), c = b.getStringValue("VALUE", b), e = b.getField("OPTION", b);
    b.isStart = !0;
    b.timeFlag = 1;
    c || "number" == typeof c || (c = "    ");
    c = Entry.convertToRoundedDecimals(c, 3);
    new Entry.Dialog(a, c, e);
    a.syncDialogVisible(a.getVisible());
    setTimeout(function() {
      b.timeFlag = 0;
    }, 1E3 * d);
  }
  return 0 == b.timeFlag ? (delete b.timeFlag, delete b.isStart, a.dialog && a.dialog.remove(), b.callReturn()) : b;
};
Blockly.Blocks.dialog = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.speak, "speak"]]), "OPTION");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.dialog(%1, %2)"]}};
Entry.block.dialog = function(a, b) {
  var d = b.getStringValue("VALUE", b);
  d || "number" == typeof d || (d = "    ");
  var c = b.getField("OPTION", b), d = Entry.convertToRoundedDecimals(d, 3);
  new Entry.Dialog(a, d, c);
  a.syncDialogVisible(a.getVisible());
  return b.callReturn();
};
Blockly.Blocks.remove_dialog = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_remove_dialog).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.remove_dialog()"]}};
Entry.block.remove_dialog = function(a, b) {
  a.dialog && a.dialog.remove();
  return b.callReturn();
};
Blockly.Blocks.change_to_nth_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("pictures"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_to_nth_shape = function(a, b) {
  var d = b.getField("VALUE", b), d = a.parent.getPicture(d);
  a.setImage(d);
  return b.callReturn();
};
Blockly.Blocks.change_to_next_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_near_shape_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.LOOKS_change_shape_next, "next"], [Lang.Blocks.LOOKS_change_shape_prev, "prev"]]), "DRIECTION").appendField(Lang.Blocks.LOOKS_change_to_near_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_to_adjacent_shape(%1)"]}};
Entry.block.change_to_next_shape = function(a, b) {
  var d;
  d = b.fields && "prev" === b.getStringField("DRIECTION") ? a.parent.getPrevPicture(a.picture.id) : a.parent.getNextPicture(a.picture.id);
  a.setImage(d);
  return b.callReturn();
};
Blockly.Blocks.set_effect_volume = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.opacity, "opacity"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.add_effect(%1, %2)"]}};
Entry.block.set_effect_volume = function(a, b) {
  var d = b.getField("EFFECT", b), c = b.getNumberValue("VALUE", b);
  "color" == d ? a.effect.hue = c + a.effect.hue : "lens" != d && "swriling" != d && "pixel" != d && "mosaic" != d && ("brightness" == d ? a.effect.brightness = c + a.effect.brightness : "blur" != d && "opacity" == d && (a.effect.alpha += c / 100));
  a.applyFilter();
  return b.callReturn();
};
Blockly.Blocks.set_effect = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.opacity, "opacity"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_effect(%1, %2)"]}};
Entry.block.set_effect = function(a, b) {
  var d = b.getField("EFFECT", b), c = b.getNumberValue("VALUE", b);
  "color" == d ? a.effect.hue = c : "lens" != d && "swriling" != d && "pixel" != d && "mosaic" != d && ("brightness" == d ? a.effect.brightness = c : "blur" != d && "opacity" == d && (a.effect.alpha = c / 100));
  a.applyFilter();
  return b.callReturn();
};
Blockly.Blocks.erase_all_effects = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_erase_all_effects).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.remove_all_effects()"]}};
Entry.block.erase_all_effects = function(a, b) {
  a.resetFilter();
  return b.callReturn();
};
Blockly.Blocks.change_scale_percent = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_scale_percent = function(a, b) {
  var d = (b.getNumberValue("VALUE", b) + 100) / 100;
  a.setScaleX(a.getScaleX() * d);
  a.setScaleY(a.getScaleY() * d);
  return b.callReturn();
};
Blockly.Blocks.set_scale_percent = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_scale_percent = function(a, b) {
  var d = b.getNumberValue("VALUE", b) / 100, c = a.snapshot_;
  a.setScaleX(d * c.scaleX);
  a.setScaleY(d * c.scaleY);
  return b.callReturn();
};
Blockly.Blocks.change_scale_size = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_size(%1)"]}};
Entry.block.change_scale_size = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setSize(a.getSize() + d);
  return b.callReturn();
};
Blockly.Blocks.set_scale_size = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_size(%1)"]}};
Entry.block.set_scale_size = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setSize(d);
  return b.callReturn();
};
Blockly.Blocks.flip_y = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_flip_y).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.flip_horizontal()"]}};
Entry.block.flip_y = function(a, b) {
  a.setScaleX(-1 * a.getScaleX());
  return b.callReturn();
};
Blockly.Blocks.flip_x = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_flip_x).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.flip_vertical()"]}};
Entry.block.flip_x = function(a, b) {
  a.setScaleY(-1 * a.getScaleY());
  return b.callReturn();
};
Blockly.Blocks.set_object_order = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_object_order_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("objectSequence"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_object_order_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_object_order = function(a, b) {
  var d = b.getField("VALUE", b);
  a = Entry.container.getCurrentObjects().indexOf(a.parent);
  if (-1 < a) {
    return Entry.container.moveElementByBlock(a, d), b.callReturn();
  }
  throw Error("object is not available");
};
Blockly.Blocks.get_pictures = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("pictures"), "VALUE");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:[]}};
Entry.block.get_pictures = function(a, b) {
  return b.getStringField("VALUE");
};
Blockly.Blocks.change_to_some_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_to_some_shape(%1)"]}};
Entry.block.change_to_some_shape = function(a, b) {
  var d = b.getStringValue("VALUE");
  Entry.parseNumber(d);
  d = a.parent.getPicture(d);
  a.setImage(d);
  return b.callReturn();
};
Blockly.Blocks.add_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.add_effect_by_cbt(%1, %2)"]}};
Entry.block.add_effect_amount = function(a, b) {
  var d = b.getField("EFFECT", b), c = b.getNumberValue("VALUE", b);
  "color" == d ? a.effect.hsv = c + a.effect.hsv : "brightness" == d ? a.effect.brightness = c + a.effect.brightness : "transparency" == d && (a.effect.alpha -= c / 100);
  a.applyFilter();
  return b.callReturn();
};
Blockly.Blocks.change_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_effect_by_cbt(%1, %2)"]}};
Entry.block.change_effect_amount = function(a, b) {
  var d = b.getField("EFFECT", b), c = b.getNumberValue("VALUE", b);
  "color" == d ? a.effect.hsv = c : "brightness" == d ? a.effect.brightness = c : "transparency" == d && (a.effect.alpha = 1 - c / 100);
  a.applyFilter();
  return b.callReturn();
};
Blockly.Blocks.set_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_effect_amount = function(a, b) {
  var d = b.getField("EFFECT", b), c = b.getNumberValue("VALUE", b);
  "color" == d ? a.effect.hue = c + a.effect.hue : "brightness" == d ? a.effect.brightness = c + a.effect.brightness : "transparency" == d && (a.effect.alpha -= c / 100);
  a.applyFilter();
  return b.callReturn();
};
Blockly.Blocks.set_entity_effect = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_entity_effect = function(a, b) {
  var d = b.getField("EFFECT", b), c = b.getNumberValue("VALUE", b);
  "color" == d ? a.effect.hue = c : "brightness" == d ? a.effect.brightness = c : "transparency" == d && (a.effect.alpha = 1 - c / 100);
  a.applyFilter();
  return b.callReturn();
};
Blockly.Blocks.change_object_index = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_object_index_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.LOOKS_change_object_index_sub_1, "FRONT"], [Lang.Blocks.LOOKS_change_object_index_sub_2, "FORWARD"], [Lang.Blocks.LOOKS_change_object_index_sub_3, "BACKWARD"], [Lang.Blocks.LOOKS_change_object_index_sub_4, "BACK"]]), "LOCATION").appendField(Lang.Blocks.LOOKS_change_object_index_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.locate_to(%1)"]}};
Entry.block.change_object_index = function(a, b) {
  var d, c = b.getField("LOCATION", b), e = Entry.container.getCurrentObjects();
  a = e.indexOf(a.parent);
  e = e.length - 1;
  if (0 > a) {
    throw Error("object is not available for current scene");
  }
  switch(c) {
    case "FRONT":
      d = 0;
      break;
    case "FORWARD":
      d = Math.max(0, a - 1);
      break;
    case "BACKWARD":
      d = Math.min(e, a + 1);
      break;
    case "BACK":
      d = e;
  }
  Entry.container.moveElementByBlock(a, d);
  return b.callReturn();
};
Blockly.Blocks.move_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_to_moving_direction(%1)"]}};
Entry.block.move_direction = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setX(a.getX() + d * Math.cos((a.getRotation() + a.getDirection() - 90) / 180 * Math.PI));
  a.setY(a.getY() - d * Math.sin((a.getRotation() + a.getDirection() - 90) / 180 * Math.PI));
  a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY());
  return b.callReturn();
};
Blockly.Blocks.move_x = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_x_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_x_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_x(%1)"]}};
Entry.block.move_x = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setX(a.getX() + d);
  a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY());
  return b.callReturn();
};
Blockly.Blocks.move_y = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_y_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_y_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_y(%1)"]}};
Entry.block.move_y = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setY(a.getY() + d);
  a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY());
  return b.callReturn();
};
Blockly.Blocks.locate_xy_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_xy_for_seconds(%1, %2, %3)"]}};
Entry.block.locate_xy_time = function(a, b) {
  if (!b.isStart) {
    var d;
    d = b.getNumberValue("VALUE1", b);
    b.isStart = !0;
    b.frameCount = Math.floor(d * Entry.FPS);
    b.x = b.getNumberValue("VALUE2", b);
    b.y = b.getNumberValue("VALUE3", b);
  }
  if (0 != b.frameCount) {
    d = b.x - a.getX();
    var c = b.y - a.getY();
    d /= b.frameCount;
    c /= b.frameCount;
    a.setX(a.getX() + d);
    a.setY(a.getY() + c);
    b.frameCount--;
    a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY());
    return b;
  }
  delete b.isStart;
  delete b.frameCount;
  return b.callReturn();
};
Blockly.Blocks.rotate_by_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setRotation(a.getRotation() + d);
  return b.callReturn();
};
Blockly.Blocks.rotate_by_angle_dropdown = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_dropdown_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["45", "45"], ["90", "90"], ["135", "135"], ["180", "180"]]), "VALUE").appendField(Lang.Blocks.MOVING_rotate_by_angle_dropdown_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle_dropdown = function(a, b) {
  var d = b.getField("VALUE", b);
  a.setRotation(a.getRotation() + Number(d));
  return b.callReturn();
};
Blockly.Blocks.see_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setDirection(d);
  return b.callReturn();
};
Blockly.Blocks.see_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_direction_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sprites"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_direction = function(a, b) {
  var d = b.getField("VALUE", b), c = Entry.container.getEntity(d), d = c.getX() - a.getX(), c = c.getY() - a.getY();
  0 <= d ? a.setRotation(Math.atan(c / d) / Math.PI * 180 + 90) : a.setRotation(Math.atan(c / d) / Math.PI * 180 + 270);
  return b.callReturn();
};
Blockly.Blocks.locate_xy = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_xy(%1, %2)"]}};
Entry.block.locate_xy = function(a, b) {
  var d = b.getNumberValue("VALUE1", b);
  a.setX(d);
  d = b.getNumberValue("VALUE2", b);
  a.setY(d);
  a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY());
  return b.callReturn();
};
Blockly.Blocks.locate_x = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_x_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_x_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_x(%1)"]}};
Entry.block.locate_x = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setX(d);
  a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY());
  return b.callReturn();
};
Blockly.Blocks.locate_y = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_y_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_y_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_y(%1)"]}};
Entry.block.locate_y = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setY(d);
  a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY());
  return b.callReturn();
};
Blockly.Blocks.locate = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_to_object(%1)"]}};
Entry.block.locate = function(a, b) {
  var d = b.getField("VALUE", b), c;
  "mouse" == d ? (d = Entry.stage.mouseCoordinate.x, c = Entry.stage.mouseCoordinate.y) : (c = Entry.container.getEntity(d), d = c.getX(), c = c.getY());
  a.setX(Number(d));
  a.setY(Number(c));
  a.brush && !a.brush.stop && a.brush.lineTo(d, -1 * c);
  return b.callReturn();
};
Blockly.Blocks.move_xy_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_xy_for_seconds(%1, %2, %3)"]}};
Entry.block.move_xy_time = function(a, b) {
  if (!b.isStart) {
    var d;
    d = b.getNumberValue("VALUE1", b);
    var c = b.getNumberValue("VALUE2", b), e = b.getNumberValue("VALUE3", b);
    b.isStart = !0;
    b.frameCount = Math.floor(d * Entry.FPS);
    b.dX = c / b.frameCount;
    b.dY = e / b.frameCount;
  }
  if (0 != b.frameCount) {
    return a.setX(a.getX() + b.dX), a.setY(a.getY() + b.dY), b.frameCount--, a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY()), b;
  }
  delete b.isStart;
  delete b.frameCount;
  return b.callReturn();
};
Blockly.Blocks.locate_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sprites"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.rotate_by_angle_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldAngle("90"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle_time = function(a, b) {
  if (!b.isStart) {
    var d;
    d = b.getNumberValue("VALUE", b);
    var c = b.getNumberField("VALUE", b);
    b.isStart = !0;
    b.frameCount = Math.floor(d * Entry.FPS);
    b.dAngle = c / b.frameCount;
  }
  if (0 != b.frameCount) {
    return a.setRotation(a.getRotation() + b.dAngle), b.frameCount--, b;
  }
  delete b.isStart;
  delete b.frameCount;
  return b.callReturn();
};
Blockly.Blocks.bounce_when = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_when_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("bounce"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_when_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.bounce_wall = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_wall).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.on_bounce_at_wall()"]}};
Entry.block.bounce_wall = function(a, b) {
  var d = a.parent.getRotateMethod(), c = "free" == d ? (a.getRotation() + a.getDirection()).mod(360) : a.getDirection(), e;
  if (90 > c && 0 <= c || 360 > c && 270 <= c) {
    e = a.collision == Entry.Utils.COLLISION.UP;
    var f = ndgmr.checkPixelCollision(Entry.stage.wall.up, a.object, 0, !1);
    !f && e && (a.collision = Entry.Utils.COLLISION.NONE);
    f && e && (f = !1);
    f ? ("free" == d ? a.setRotation(-a.getRotation() - 2 * a.getDirection() + 180) : a.setDirection(-a.getDirection() + 180), a.collision = Entry.Utils.COLLISION.UP) : (e = a.collision == Entry.Utils.COLLISION.DOWN, f = ndgmr.checkPixelCollision(Entry.stage.wall.down, a.object, 0, !1), !f && e && (a.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f && ("free" == d ? a.setRotation(-a.getRotation() - 2 * a.getDirection() + 180) : a.setDirection(-a.getDirection() + 180), a.collision = 
    Entry.Utils.COLLISION.DOWN));
  } else {
    270 > c && 90 <= c && (e = a.collision == Entry.Utils.COLLISION.DOWN, f = ndgmr.checkPixelCollision(Entry.stage.wall.down, a.object, 0, !1), !f && e && (a.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f ? ("free" == d ? a.setRotation(-a.getRotation() - 2 * a.getDirection() + 180) : a.setDirection(-a.getDirection() + 180), a.collision = Entry.Utils.COLLISION.DOWN) : (e = a.collision == Entry.Utils.COLLISION.UP, f = ndgmr.checkPixelCollision(Entry.stage.wall.up, a.object, 0, !1), 
    !f && e && (a.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f && ("free" == d ? a.setRotation(-a.getRotation() - 2 * a.getDirection() + 180) : a.setDirection(-a.getDirection() + 180), a.collision = Entry.Utils.COLLISION.UP)));
  }
  360 > c && 180 <= c ? (e = a.collision == Entry.Utils.COLLISION.LEFT, c = ndgmr.checkPixelCollision(Entry.stage.wall.left, a.object, 0, !1), !c && e && (a.collision = Entry.Utils.COLLISION.NONE), c && e && (c = !1), c ? ("free" == d ? a.setRotation(-a.getRotation() - 2 * a.getDirection()) : a.setDirection(-a.getDirection() + 360), a.collision = Entry.Utils.COLLISION.LEFT) : (e = a.collision == Entry.Utils.COLLISION.RIGHT, c = ndgmr.checkPixelCollision(Entry.stage.wall.right, a.object, 0, !1), !c && 
  e && (a.collision = Entry.Utils.COLLISION.NONE), c && e && (c = !1), c && ("free" == d ? a.setRotation(-a.getRotation() - 2 * a.getDirection()) : a.setDirection(-a.getDirection() + 360), a.collision = Entry.Utils.COLLISION.RIGHT))) : 180 > c && 0 <= c && (e = a.collision == Entry.Utils.COLLISION.RIGHT, c = ndgmr.checkPixelCollision(Entry.stage.wall.right, a.object, 0, !1), !c && e && (a.collision = Entry.Utils.COLLISION.NONE), c && e && (c = !1), c ? ("free" == d ? a.setRotation(-a.getRotation() - 
  2 * a.getDirection()) : a.setDirection(-a.getDirection() + 360), a.collision = Entry.Utils.COLLISION.RIGHT) : (e = a.collision == Entry.Utils.COLLISION.LEFT, c = ndgmr.checkPixelCollision(Entry.stage.wall.left, a.object, 0, !1), !c && e && (a.collision = Entry.Utils.COLLISION.NONE), c && e && (c = !1), c && ("free" == d ? a.setRotation(-a.getRotation() - 2 * a.getDirection()) : a.setDirection(-a.getDirection() + 360), a.collision = Entry.Utils.COLLISION.LEFT)));
  return b.callReturn();
};
Blockly.Blocks.flip_arrow_horizontal = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_flip_arrow_horizontal).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_arrow_horizontal = function(a, b) {
  a.setDirection(a.getDirection() + 180);
  return b.callReturn();
};
Blockly.Blocks.flip_arrow_vertical = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_flip_arrow_vertical).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_arrow_vertical = function(a, b) {
  a.setDirection(a.getDirection() + 180);
  return b.callReturn();
};
Blockly.Blocks.see_angle_object = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_object_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_object_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.look_at_object(%1)"]}};
Entry.block.see_angle_object = function(a, b) {
  var d = b.getField("VALUE", b), c = a.getX(), e = a.getY();
  if (a.parent.id == d) {
    return b.callReturn();
  }
  "mouse" == d ? (d = Entry.stage.mouseCoordinate.y, c = Entry.stage.mouseCoordinate.x - c, e = d - e) : (d = Entry.container.getEntity(d), c = d.getX() - c, e = d.getY() - e);
  e = 0 === c && 0 === e ? a.getDirection() + a.getRotation() : 0 <= c ? -Math.atan(e / c) / Math.PI * 180 + 90 : -Math.atan(e / c) / Math.PI * 180 + 270;
  c = a.getDirection() + a.getRotation();
  a.setRotation(a.getRotation() + e - c);
  return b.callReturn();
};
Blockly.Blocks.see_angle_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle_direction = function(a, b) {
  var d = b.getNumberValue("VALUE", b), c = a.getDirection() + a.getRotation();
  a.setRotation(a.getRotation() + d - c);
  return b.callReturn();
};
Blockly.Blocks.rotate_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_direction = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setDirection(d + a.getDirection());
  return b.callReturn();
};
Blockly.Blocks.locate_object_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "TARGET");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_at_object_for_seconds(%1, %2)"]}};
Entry.block.locate_object_time = function(a, b) {
  if (!b.isStart) {
    var d, c, e;
    c = b.getField("TARGET", b);
    d = b.getNumberValue("VALUE", b);
    d = Math.floor(d * Entry.FPS);
    e = Entry.stage.mouseCoordinate;
    if (0 != d) {
      "mouse" == c ? (c = e.x - a.getX(), e = e.y - a.getY()) : (e = Entry.container.getEntity(c), c = e.getX() - a.getX(), e = e.getY() - a.getY()), b.isStart = !0, b.frameCount = d, b.dX = c / b.frameCount, b.dY = e / b.frameCount;
    } else {
      return "mouse" == c ? (c = Number(e.x), e = Number(e.y)) : (e = Entry.container.getEntity(c), c = e.getX(), e = e.getY()), a.setX(c), a.setY(e), a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY()), b.callReturn();
    }
  }
  if (0 != b.frameCount) {
    return a.setX(a.getX() + b.dX), a.setY(a.getY() + b.dY), b.frameCount--, a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY()), b;
  }
  delete b.isStart;
  delete b.frameCount;
  return b.callReturn();
};
Blockly.Blocks.rotate_absolute = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_set_direction_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_set_direction_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_direction(%1)"]}};
Entry.block.rotate_absolute = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setRotation(d);
  return b.callReturn();
};
Blockly.Blocks.rotate_relative = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.rotate_direction(%1)"]}};
Entry.block.rotate_relative = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setRotation(d + a.getRotation());
  return b.callReturn();
};
Blockly.Blocks.direction_absolute = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_moving_direction(%1)"]}};
Entry.block.direction_absolute = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setDirection(d);
  return b.callReturn();
};
Blockly.Blocks.direction_relative = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.rotate_moving_direction(%1)"]}};
Entry.block.direction_relative = function(a, b) {
  var d = b.getNumberValue("VALUE", b);
  a.setDirection(d + a.getDirection());
  return b.callReturn();
};
Blockly.Blocks.move_to_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_1);
  this.appendValueInput("ANGLE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_to_direction_by_distance(%1, %2)"]}};
Entry.block.move_to_angle = function(a, b) {
  var d = b.getNumberValue("VALUE", b), c = b.getNumberValue("ANGLE", b);
  a.setX(a.getX() + d * Math.cos((c - 90) / 180 * Math.PI));
  a.setY(a.getY() - d * Math.sin((c - 90) / 180 * Math.PI));
  a.brush && !a.brush.stop && a.brush.lineTo(a.getX(), -1 * a.getY());
  return b.callReturn();
};
Blockly.Blocks.rotate_by_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_explain_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_2);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_1);
  this.appendValueInput("ANGLE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.rotate_direction_for_seconds(%1, %2)"]}};
Entry.block.rotate_by_time = function(a, b) {
  if (!b.isStart) {
    var d;
    d = b.getNumberValue("VALUE", b);
    var c = b.getNumberValue("ANGLE", b);
    b.isStart = !0;
    b.frameCount = Math.floor(d * Entry.FPS);
    b.dAngle = c / b.frameCount;
  }
  if (0 != b.frameCount) {
    return a.setRotation(a.getRotation() + b.dAngle), b.frameCount--, b;
  }
  delete b.isStart;
  delete b.frameCount;
  return b.callReturn();
};
Blockly.Blocks.direction_relative_duration = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_1);
  this.appendValueInput("DURATION").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_2);
  this.appendValueInput("AMOUNT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.rotate_moving_direction_for_seconds(%1, %2)"]}};
Entry.block.direction_relative_duration = function(a, b) {
  if (!b.isStart) {
    var d;
    d = b.getNumberValue("DURATION", b);
    var c = b.getNumberValue("AMOUNT", b);
    b.isStart = !0;
    b.frameCount = Math.floor(d * Entry.FPS);
    b.dDirection = c / b.frameCount;
  }
  if (0 != b.frameCount) {
    return a.setDirection(a.getDirection() + b.dDirection), b.frameCount--, b;
  }
  delete b.isStart;
  delete b.frameCount;
  delete b.dDirection;
  return b.callReturn();
};
Entry.Neobot = {name:"neobot", LOCAL_MAP:["IN1", "IN2", "IN3", "IR", "BAT"], REMOTE_MAP:"OUT1 OUT2 OUT3 DCR DCL SND FND OPT".split(" "), setZero:function() {
  for (var a in Entry.Neobot.REMOTE_MAP) {
    Entry.hw.sendQueue[Entry.Neobot.REMOTE_MAP[a]] = 0;
  }
  Entry.hw.update();
}, name:"neobot", monitorTemplate:{imgPath:"hw/neobot.png", width:700, height:700, listPorts:{IR:{name:"\ub9ac\ubaa8\ucee8", type:"input", pos:{x:0, y:0}}, BAT:{name:"\ubca0\ud130\ub9ac", type:"input", pos:{x:0, y:0}}, SND:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, FND:{name:"FND", type:"output", pos:{x:0, y:0}}}, ports:{IN1:{name:"IN1", type:"input", pos:{x:270, y:200}}, IN2:{name:"IN2", type:"input", pos:{x:325, y:200}}, IN3:{name:"IN3", type:"input", pos:{x:325, y:500}}, DCL:{name:"L-Motor", 
type:"output", pos:{x:270, y:500}}, DCR:{name:"R-Motor", type:"output", pos:{x:435, y:500}}, OUT1:{name:"OUT1", type:"output", pos:{x:380, y:200}}, OUT2:{name:"OUT2", type:"output", pos:{x:435, y:200}}, OUT3:{name:"OUT3", type:"output", pos:{x:380, y:500}}}, mode:"both"}};
Blockly.Blocks.neobot_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1\ubc88 \ud3ec\ud2b8", "IN1"], ["2\ubc88 \ud3ec\ud2b8", "IN2"], ["3\ubc88 \ud3ec\ud2b8", "IN3"], ["\ub9ac\ubaa8\ucee8", "IR"], ["\ubc30\ud130\ub9ac", "BAT"]]), "PORT").appendField(" \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.neobot_sensor_value = function(a, b) {
  a = b.getStringField("PORT");
  return Entry.hw.portData[a];
};
Blockly.Blocks.neobot_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_left_motor = function(a, b) {
  a = b.getNumberField("SPEED");
  var d = b.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCL = a + d;
  return b.callReturn();
};
Blockly.Blocks.neobot_stop_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_left_motor = function(a, b) {
  Entry.hw.sendQueue.DCL = 0;
  return b.callReturn();
};
Blockly.Blocks.neobot_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_right_motor = function(a, b) {
  a = b.getNumberField("SPEED");
  var d = b.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCR = a + d;
  return b.callReturn();
};
Blockly.Blocks.neobot_stop_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_right_motor = function(a, b) {
  Entry.hw.sendQueue.DCR = 0;
  return b.callReturn();
};
Blockly.Blocks.neobot_all_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc591\ucabd \ubaa8\ud130\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField(" \uc758 \uc18d\ub3c4\ub85c ").appendField(new Blockly.FieldDropdown([["\uc804\uc9c4", "1"], ["\ud6c4\uc9c4", "2"], ["\uc81c\uc790\ub9ac \uc88c\ud68c\uc804", "3"], ["\uc81c\uc790\ub9ac \uc6b0\ud68c\uc804", "4"], 
  ["\uc88c\ud68c\uc804", "5"], ["\uc6b0\ud68c\uc804", "6"]]), "DIRECTION").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_all_motor = function(a, b) {
  b.getNumberField("TYPE");
  a = b.getNumberField("SPEED");
  switch(b.getNumberField("DIRECTION")) {
    case 1:
      Entry.hw.sendQueue.DCL = 16 + a;
      Entry.hw.sendQueue.DCR = 16 + a;
      break;
    case 2:
      Entry.hw.sendQueue.DCL = 32 + a;
      Entry.hw.sendQueue.DCR = 32 + a;
      break;
    case 3:
      Entry.hw.sendQueue.DCL = 32 + a;
      Entry.hw.sendQueue.DCR = 16 + a;
      break;
    case 4:
      Entry.hw.sendQueue.DCL = 16 + a;
      Entry.hw.sendQueue.DCR = 32 + a;
      break;
    case 5:
      Entry.hw.sendQueue.DCL = 0;
      Entry.hw.sendQueue.DCR = 16 + a;
      break;
    case 6:
      Entry.hw.sendQueue.DCL = 16 + a, Entry.hw.sendQueue.DCR = 0;
  }
  return b.callReturn();
};
Blockly.Blocks.neobot_set_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ud3ec\ud2b8\uc758 \uc11c\ubcf4\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["0\ub3c4", "0"], ["10\ub3c4", "10"], ["20\ub3c4", "20"], ["30\ub3c4", "30"], ["40\ub3c4", "40"], ["50\ub3c4", "50"], ["60\ub3c4", "60"], ["70\ub3c4", "70"], ["80\ub3c4", "80"], ["90\ub3c4", "90"], ["100\ub3c4", "100"], ["110\ub3c4", "110"], ["120\ub3c4", "120"], ["130\ub3c4", 
  "130"], ["140\ub3c4", "140"], ["150\ub3c4", "150"], ["160\ub3c4", "160"], ["170\ub3c4", "170"], ["180\ub3c4", "180"]]), "DEGREE").appendField(" \uc774\ub3d9").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_servo = function(a, b) {
  a = b.getNumberField("PORT");
  var d = b.getNumberField("DEGREE");
  Entry.hw.sendQueue["OUT" + a] = d;
  3 === a && (a = 4);
  Entry.hw.sendQueue.OPT |= a;
  return b.callReturn();
};
Blockly.Blocks.neobot_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ubc88 \ud3ec\ud2b8\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_output = function(a, b) {
  a = b.getStringField("PORT", b);
  var d = b.getNumberValue("VALUE", b), c = a;
  0 > d ? d = 0 : 255 < d && (d = 255);
  3 === c && (c = 4);
  Entry.hw.sendQueue["OUT" + a] = d;
  Entry.hw.sendQueue.OPT &= ~c;
  return b.callReturn();
};
Blockly.Blocks.neobot_set_fnd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("FND\uc5d0");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_fnd = function(a, b) {
  a = b.getNumberValue("VALUE", b);
  255 < a ? a = 255 : 0 > a && (a = 0);
  Entry.hw.sendQueue.FND = a;
  return b.callReturn();
};
Blockly.Blocks.neobot_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uba5c\ub85c\ub514").appendField(new Blockly.FieldDropdown([["\ubb34\uc74c", "0"], [Lang.General.note_c, "1"], [Lang.General.note_c + "#", "2"], [Lang.General.note_d, "3"], [Lang.General.note_d + "#", "4"], [Lang.General.note_e, "5"], [Lang.General.note_f, "6"], [Lang.General.note_f + "#", "7"], [Lang.General.note_g, "8"], [Lang.General.note_g + "#", "9"], [Lang.General.note_a, "10"], [Lang.General.note_a + "#", "11"], [Lang.General.note_b, "12"]]), "NOTE").appendField("\uc744(\ub97c)").appendField(new Blockly.FieldDropdown([["1", 
  "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"]]), "OCTAVE").appendField("\uc625\ud0c0\ube0c\ub85c").appendField(new Blockly.FieldDropdown([["2\ubd84\uc74c\ud45c", "2"], ["4\ubd84\uc74c\ud45c", "4"], ["8\ubd84\uc74c\ud45c", "8"], ["16\ubd84\uc74c\ud45c", "16"]]), "DURATION");
  this.appendDummyInput().appendField("\uae38\uc774\ub9cc\ud07c \uc18c\ub9ac\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_play_note_for = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.hw.sendQueue.SND = 0;
    Entry.engine.isContinue = !1;
    return b.callReturn();
  }
  var d = b.getNumberField("NOTE", b), c = b.getNumberField("OCTAVE", b), e = b.getNumberField("DURATION", b), d = d + 12 * c;
  b.isStart = !0;
  b.timeFlag = 1;
  65 < d && (d = 65);
  a.SND = d;
  setTimeout(function() {
    b.timeFlag = 0;
  }, 1 / e * 2E3);
  return b;
};
Entry.Robotis_carCont = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED:[67, 1], CM_SPRING_RIGHT:[69, 1, 69, 2], CM_SPRING_LEFT:[70, 1, 69, 2], CM_SWITCH:[71, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_IR_LEFT:[91, 2, 91, 4], CM_IR_RIGHT:[93, 2, 91, 4], CM_CALIBRATION_LEFT:[95, 2], CM_CALIBRATION_RIGHT:[97, 2], AUX_MOTOR_SPEED_LEFT:[152, 2], AUX_MOTOR_SPEED_RIGHT:[154, 2]}, setZero:function() {
  this.setRobotisData([[Entry.Robotis_carCont.INSTRUCTION.WRITE, 152, 2, 0], [Entry.Robotis_carCont.INSTRUCTION.WRITE, 154, 2, 0]]);
  Entry.hw.sendQueue.setZero = [1];
  this.update();
  this.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  this.update();
}, name:"robotis_carCont", delay:40, postCallReturn:function(a, b, d) {
  if (0 >= d) {
    return this.setRobotisData(b), this.update(), a.callReturn();
  }
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return this.setRobotisData(null), a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    this.update();
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  this.setRobotisData(b);
  setTimeout(function() {
    a.timeFlag = 0;
  }, d);
  return a;
}, wait:function(a, b) {
  Entry.hw.socket.send(JSON.stringify(a));
  for (var d = a = (new Date).getTime();d < a + b;) {
    d = (new Date).getTime();
  }
}, update:function() {
  Entry.hw.update();
  this.setRobotisData(null);
}, setRobotisData:function(a) {
  Entry.hw.sendQueue.ROBOTIS_DATA = null == a ? null : Entry.hw.sendQueue.ROBOTIS_DATA ? Entry.hw.sendQueue.ROBOTIS_DATA.concat(a) : a;
}};
Entry.Robotis_openCM70 = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED_R:[79, 1], CM_LED_G:[80, 1], CM_LED_B:[81, 1], CM_BUZZER_INDEX:[84, 1], CM_BUZZER_TIME:[85, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_USER_BUTTON:[26, 1], CM_MOTION:[66, 1], AUX_SERVO_POSITION:[152, 2], AUX_IR:[168, 2], AUX_TOUCH:[202, 1], AUX_TEMPERATURE:[234, 1], AUX_ULTRASONIC:[242, 1], AUX_MAGNETIC:[250, 1], AUX_MOTION_DETECTION:[258, 1], AUX_COLOR:[266, 1], AUX_CUSTOM:[216, 2], AUX_BRIGHTNESS:[288, 
2], AUX_HYDRO_THEMO_HUMIDITY:[274, 1], AUX_HYDRO_THEMO_TEMPER:[282, 1], AUX_SERVO_MODE:[126, 1], AUX_SERVO_SPEED:[136, 2], AUX_MOTOR_SPEED:[136, 2], AUX_LED_MODULE:[210, 1]}, setZero:function() {
  Entry.Robotis_carCont.setRobotisData([[Entry.Robotis_openCM70.INSTRUCTION.WRITE, 136, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 138, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 140, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 142, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 144, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 146, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 79, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 80, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 
  81, 1, 0]]);
  Entry.hw.sendQueue.setZero = [1];
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  Entry.Robotis_carCont.update();
}, name:"robotis_openCM70", delay:15};
Blockly.Blocks.robotis_openCM70_cm_custom_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["BYTE", "BYTE"], ["WORD", "WORD"], ["DWORD", "DWORD"]]), "SIZE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_openCM70_cm_custom_value = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var d = 0, c = b.getStringField("SIZE");
  "BYTE" == c ? d = 1 : "WORD" == c ? d = 2 : "DWORD" == c && (d = 4);
  b = b.getNumberValue("VALUE");
  Entry.Robotis_carCont.setRobotisData([[a, b, d, 0, d]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[b];
};
Blockly.Blocks.robotis_openCM70_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, sensorList:function() {
  var a = [];
  a.push([Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"]);
  a.push([Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"]);
  a.push([Lang.Blocks.robotis_cm_user_button, "CM_USER_BUTTON"]);
  return a;
}};
Entry.block.robotis_openCM70_sensor_value = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var d = 0, c = 0, e = 0, f = 0;
  b = b.getStringField("SENSOR");
  "CM_SOUND_DETECTED" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : "CM_SOUND_DETECTING" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_USER_BUTTON" == b && (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1]);
  e += 0 * f;
  Entry.Robotis_carCont.setRobotisData([[a, d, c, 0, f]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[e];
};
Blockly.Blocks.robotis_openCM70_aux_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.portList()), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, portList:function() {
  var a = [];
  a.push([Lang.Blocks.robotis_common_port_3, "PORT_3"]);
  a.push([Lang.Blocks.robotis_common_port_4, "PORT_4"]);
  a.push([Lang.Blocks.robotis_common_port_5, "PORT_5"]);
  a.push([Lang.Blocks.robotis_common_port_6, "PORT_6"]);
  return a;
}, sensorList:function() {
  var a = [];
  a.push([Lang.Blocks.robotis_aux_servo_position, "AUX_SERVO_POSITION"]);
  a.push([Lang.Blocks.robotis_aux_ir, "AUX_IR"]);
  a.push([Lang.Blocks.robotis_aux_touch, "AUX_TOUCH"]);
  a.push([Lang.Blocks.robotis_aux_brightness, "AUX_BRIGHTNESS"]);
  a.push([Lang.Blocks.robotis_aux_hydro_themo_humidity, "AUX_HYDRO_THEMO_HUMIDITY"]);
  a.push([Lang.Blocks.robotis_aux_hydro_themo_temper, "AUX_HYDRO_THEMO_TEMPER"]);
  a.push([Lang.Blocks.robotis_aux_temperature, "AUX_TEMPERATURE"]);
  a.push([Lang.Blocks.robotis_aux_ultrasonic, "AUX_ULTRASONIC"]);
  a.push([Lang.Blocks.robotis_aux_magnetic, "AUX_MAGNETIC"]);
  a.push([Lang.Blocks.robotis_aux_motion_detection, "AUX_MOTION_DETECTION"]);
  a.push([Lang.Blocks.robotis_aux_color, "AUX_COLOR"]);
  a.push([Lang.Blocks.robotis_aux_custom, "AUX_CUSTOM"]);
  return a;
}};
Entry.block.robotis_openCM70_aux_sensor_value = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var d = 0, c = 0, e = 0, f = 0, g = b.getStringField("PORT");
  b = b.getStringField("SENSOR");
  var h = 0;
  "PORT_3" == g ? h = 2 : "PORT_4" == g ? h = 3 : "PORT_5" == g ? h = 4 : "PORT_6" == g && (h = 5);
  "AUX_SERVO_POSITION" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1]) : "AUX_IR" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1]) : 
  "AUX_TOUCH" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1]) : "AUX_TEMPERATURE" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1]) : 
  "AUX_BRIGHTNESS" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1]) : "AUX_HYDRO_THEMO_HUMIDITY" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1]) : "AUX_HYDRO_THEMO_TEMPER" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1]) : "AUX_ULTRASONIC" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1]) : "AUX_MAGNETIC" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1]) : "AUX_MOTION_DETECTION" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1]) : "AUX_COLOR" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1]) : "AUX_CUSTOM" == b && (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1]);
  e += h * f;
  0 != h && (c = 6 * f);
  Entry.Robotis_carCont.setRobotisData([[a, d, c, 0, f]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[e];
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_index = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_index);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.note_a + "(0)", "0"], [Lang.General.note_a + "#(1)", "1"], [Lang.General.note_b + "(2)", "2"], [Lang.General.note_c + "(3)", "3"], [Lang.General.note_c + "#(4)", "4"], [Lang.General.note_d + "(5)", "5"], [Lang.General.note_d + "#(6)", "6"], [Lang.General.note_e + "(7)", "7"], [Lang.General.note_f + "(8)", "8"], [Lang.General.note_f + "#(9)", "9"], [Lang.General.note_g + "(10)", "10"], [Lang.General.note_g + "#(11)", "11"], 
  [Lang.General.note_a + "(12)", "12"], [Lang.General.note_a + "#(13)", "13"], [Lang.General.note_b + "(14)", "14"], [Lang.General.note_c + "(15)", "15"], [Lang.General.note_c + "#(16)", "16"], [Lang.General.note_d + "(17)", "17"], [Lang.General.note_d + "#(18)", "18"], [Lang.General.note_e + "(19)", "19"], [Lang.General.note_f + "(20)", "20"], [Lang.General.note_f + "#(21)", "21"], [Lang.General.note_g + "(22)", "22"], [Lang.General.note_g + "#(23)", "23"], [Lang.General.note_a + "(24)", "24"], 
  [Lang.General.note_a + "#(25)", "25"], [Lang.General.note_b + "(26)", "26"], [Lang.General.note_c + "(27)", "27"], [Lang.General.note_c + "#(28)", "28"], [Lang.General.note_d + "(29)", "29"], [Lang.General.note_d + "#(30)", "30"], [Lang.General.note_e + "(31)", "31"], [Lang.General.note_f + "(32)", "32"], [Lang.General.note_f + "#(33)", "33"], [Lang.General.note_g + "(34)", "34"], [Lang.General.note_g + "#(35)", "35"], [Lang.General.note_a + "(36)", "36"], [Lang.General.note_a + "#(37)", "37"], 
  [Lang.General.note_b + "(38)", "38"], [Lang.General.note_c + "(39)", "39"], [Lang.General.note_c + "#(40)", "40"], [Lang.General.note_d + "(41)", "41"], [Lang.General.note_d + "#(42)", "42"], [Lang.General.note_e + "(43)", "43"], [Lang.General.note_f + "(44)", "44"], [Lang.General.note_f + "#(45)", "45"], [Lang.General.note_g + "(46)", "46"], [Lang.General.note_g + "#(47)", "47"], [Lang.General.note_a + "(48)", "48"], [Lang.General.note_a + "#(49)", "49"], [Lang.General.note_b + "(50)", "50"], 
  [Lang.General.note_c + "(51)", "51"]]), "CM_BUZZER_INDEX").appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("CM_BUZZER_TIME").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3).appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_index = function(a, b) {
  a = b.getField("CM_BUZZER_INDEX", b);
  var d = b.getNumberValue("CM_BUZZER_TIME", b), c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f, g;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1];
  g = parseInt(10 * d);
  50 < g && (g = 50);
  return Entry.Robotis_carCont.postCallReturn(b, [[c, e, f, g], [c, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1], a]], 1E3 * d);
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_melody);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"], ["22", "22"], ["23", "23"], ["24", "24"]]), "CM_BUZZER_MELODY");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_melody = function(a, b) {
  a = b.getField("CM_BUZZER_MELODY", b);
  var d = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  return Entry.Robotis_carCont.postCallReturn(b, [[d, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], 255], [d, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1], a]], 1E3);
};
Blockly.Blocks.robotis_openCM70_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_sound_detected_clear = function(a, b) {
  return Entry.Robotis_carCont.postCallReturn(b, [[Entry.Robotis_openCM70.INSTRUCTION.WRITE, Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], 0]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_red_color, "CM_LED_R"], [Lang.Blocks.robotis_common_green_color, "CM_LED_G"], [Lang.Blocks.robotis_common_blue_color, "CM_LED_B"]]), "CM_LED").appendField("LED").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_led = function(a, b) {
  a = b.getField("CM_LED", b);
  var d = b.getField("VALUE", b), c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e = 0, f = 0;
  "CM_LED_R" == a ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[1]) : "CM_LED_G" == a ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[1]) : "CM_LED_B" == a && (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[1]);
  return Entry.Robotis_carCont.postCallReturn(b, [[c, e, f, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_motion = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_motion);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_motion).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_motion = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var d, c, e;
  d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[0];
  c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[1];
  e = b.getNumberValue("VALUE", b);
  return Entry.Robotis_carCont.postCallReturn(b, [[a, d, c, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_1, "1"], [Lang.Blocks.robotis_common_port_2, "2"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_motor_speed = function(a, b) {
  a = b.getField("PORT", b);
  var d = b.getField("DIRECTION_ANGLE", b), c = b.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f, g;
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[0];
  g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[1];
  "CW" == d ? (c += 1024, 2047 < c && (c = 2047)) : 1023 < c && (c = 1023);
  return Entry.Robotis_carCont.postCallReturn(b, [[e, f + (a - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_mode = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_mode_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_wheel_mode, "0"], [Lang.Blocks.robotis_common_joint_mode, "1"]]), "MODE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_mode = function(a, b) {
  a = b.getField("PORT", b);
  var d = b.getField("MODE", b), c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[1];
  return Entry.Robotis_carCont.postCallReturn(b, [[c, e + (a - 1) * f, f, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_speed = function(a, b) {
  a = b.getField("PORT", b);
  var d = b.getField("DIRECTION_ANGLE", b), c = b.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f, g;
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[0];
  g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[1];
  "CW" == d ? (c += 1024, 2047 < c && (c = 2047)) : 1023 < c && (c = 1023);
  return Entry.Robotis_carCont.postCallReturn(b, [[e, f + (a - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_position = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_position_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_position = function(a, b) {
  a = b.getField("PORT", b);
  var d = b.getNumberValue("VALUE"), c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1];
  1023 < d ? d = 1023 : 0 > d && (d = 0);
  return Entry.Robotis_carCont.postCallReturn(b, [[c, e + (a - 1) * f, f, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_led_module = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_led_module_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_off, "0"], [Lang.Blocks.robotis_cm_led_right + Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_cm_led_left + 
  Lang.Blocks.robotis_common_on, "2"], [Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_on, "3"]]), "LED_MODULE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_led_module = function(a, b) {
  a = b.getField("PORT", b);
  var d = b.getField("LED_MODULE", b), c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[1];
  return Entry.Robotis_carCont.postCallReturn(b, [[c, e + (a - 1) * f, f, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_custom_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_custom = function(a, b) {
  a = b.getField("PORT", b);
  var d = b.getNumberValue("VALUE"), c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1];
  return Entry.Robotis_carCont.postCallReturn(b, [[c, e + (a - 1) * f, f, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("ADDRESS").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_case_01);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_custom = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var d, c;
  d = b.getNumberValue("ADDRESS");
  c = b.getNumberValue("VALUE");
  return Entry.Robotis_carCont.postCallReturn(b, [[a, d, 65535 < c ? 4 : 255 < c ? 2 : 1, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_carCont_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_spring_left, "CM_SPRING_LEFT"], [Lang.Blocks.robotis_cm_spring_right, "CM_SPRING_RIGHT"], [Lang.Blocks.robotis_cm_switch, "CM_SWITCH"], [Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"], [Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"], [Lang.Blocks.robotis_cm_ir_left, "CM_IR_LEFT"], [Lang.Blocks.robotis_cm_ir_right, "CM_IR_RIGHT"], [Lang.Blocks.robotis_cm_calibration_left, 
  "CM_CALIBRATION_LEFT"], [Lang.Blocks.robotis_cm_calibration_right, "CM_CALIBRATION_RIGHT"]]), "SENSOR").appendField(" ").appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_carCont_sensor_value = function(a, b) {
  a = Entry.Robotis_carCont.INSTRUCTION.READ;
  var d = 0, c = 0, e = 0, f = 0;
  b = b.getStringField("SENSOR");
  "CM_SPRING_LEFT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[2], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[3]) : "CM_SPRING_RIGHT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[2], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[3]) : 
  "CM_SWITCH" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1]) : "CM_SOUND_DETECTED" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : 
  "CM_SOUND_DETECTING" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_IR_LEFT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[2], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[3]) : 
  "CM_IR_RIGHT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[2], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[3]) : "CM_CALIBRATION_LEFT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : 
  "CM_CALIBRATION_RIGHT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]) : "CM_BUTTON_STATUS" == b && (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], 
  c = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1]);
  Entry.Robotis_carCont.setRobotisData([[a, d, c, 0, f]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[e];
};
Blockly.Blocks.robotis_carCont_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_led_4).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_LEFT").appendField(", ").appendField(Lang.Blocks.robotis_cm_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_RIGHT").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_led = function(a, b) {
  a = b.getField("VALUE_LEFT", b);
  var d = b.getField("VALUE_RIGHT", b), c = Entry.Robotis_carCont.INSTRUCTION.WRITE, e, f, g = 0;
  e = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[0];
  f = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[1];
  1 == a && 1 == d ? g = 9 : 1 == a && 0 == d && (g = 8);
  0 == a && 1 == d && (g = 1);
  return Entry.Robotis_carCont.postCallReturn(b, [[c, e, f, g]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_sound_detected_clear = function(a, b) {
  return Entry.Robotis_carCont.postCallReturn(b, [[Entry.Robotis_carCont.INSTRUCTION.WRITE, Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], 0]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_aux_motor_speed = function(a, b) {
  var d = b.getField("DIRECTION", b);
  a = b.getField("DIRECTION_ANGLE", b);
  var c = b.getNumberValue("VALUE"), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f;
  "LEFT" == d ? (d = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[1]) : (d = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[1]);
  "CW" == a ? (c += 1024, 2047 < c && (c = 2047)) : 1023 < c && (c = 1023);
  return Entry.Robotis_carCont.postCallReturn(b, [[e, d, f, c]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_calibration = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_calibration_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_calibration = function(a, b) {
  var d = b.getField("DIRECTION", b);
  a = b.getNumberValue("VALUE");
  var c = Entry.Robotis_carCont.INSTRUCTION.WRITE, e;
  "LEFT" == d ? (d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : (d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]);
  return Entry.Robotis_carCont.postCallReturn(b, [[c, d, e, a]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.when_scene_start = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_scene_1_2.png", "*", "start")).appendField(Lang.Blocks.SCENE_when_scene_start);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_start_scene()"]}};
Entry.block.when_scene_start = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.start_scene = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.SCENE_start_scene_1).appendField(new Blockly.FieldDropdownDynamic("scenes"), "VALUE").appendField(Lang.Blocks.SCENE_start_scene_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.on_start_scene(%1)"]}};
Entry.block.start_scene = function(a, b) {
  a = b.getField("VALUE", b);
  if (a = Entry.scene.getSceneById(a)) {
    Entry.scene.selectScene(a), Entry.engine.fireEvent("when_scene_start");
  }
  return null;
};
Blockly.Blocks.start_neighbor_scene = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.SCENE_start_neighbor_scene_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.SCENE_start_scene_next, "next"], [Lang.Blocks.SCENE_start_scene_pre, "pre"]]), "OPERATOR").appendField(Lang.Blocks.SCENE_start_neighbor_scene_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:['Entry.start_neighbor_scene("%1")']}};
Entry.block.start_neighbor_scene = function(a, b) {
  var d = Entry.scene.selectedScene;
  a = Entry.scene.getScenes();
  d = a.indexOf(d);
  "next" == b.getField("OPERATOR", b) ? d + 1 < a.length && (b = Entry.scene.getSceneById(a[d + 1].id)) && (Entry.scene.selectScene(b), Entry.engine.fireEvent("when_scene_start")) : 0 < d && (b = Entry.scene.getSceneById(a[d - 1].id)) && (Entry.scene.selectScene(b), Entry.engine.fireEvent("when_scene_start"));
  return null;
};
Blockly.Blocks.sound_something = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something = function(a, b) {
  var d = b.getField("VALUE", b);
  Entry.isExist(d, "id", a.parent.sounds) && createjs.Sound.play(d);
  return b.callReturn();
};
Blockly.Blocks.sound_something_second = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second = function(a, b) {
  var d = b.getField("VALUE", b), c = b.getNumberValue("SECOND", b);
  if (Entry.isExist(d, "id", a.parent.sounds)) {
    var e = createjs.Sound.play(d);
    setTimeout(function() {
      e.stop();
    }, 1E3 * c);
  }
  return b.callReturn();
};
Blockly.Blocks.sound_something_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_wait = function(a, b) {
  if (b.isPlay) {
    if (1 == b.playState) {
      return b;
    }
    delete b.playState;
    delete b.isPlay;
    return b.callReturn();
  }
  b.isPlay = !0;
  b.playState = 1;
  var d = b.getField("VALUE", b), c = a.parent.getSound(d);
  Entry.isExist(d, "id", a.parent.sounds) && (createjs.Sound.play(d), setTimeout(function() {
    b.playState = 0;
  }, 1E3 * c.duration));
  return b;
};
Blockly.Blocks.sound_something_second_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second_wait = function(a, b) {
  if (b.isPlay) {
    if (1 == b.playState) {
      return b;
    }
    delete b.isPlay;
    delete b.playState;
    return b.callReturn();
  }
  b.isPlay = !0;
  b.playState = 1;
  var d = b.getField("VALUE", b);
  if (Entry.isExist(d, "id", a.parent.sounds)) {
    var c = createjs.Sound.play(d);
    a = b.getNumberValue("SECOND", b);
    setTimeout(function() {
      c.stop();
      b.playState = 0;
    }, 1E3 * a);
    c.addEventListener("complete", function(b) {
    });
  }
  return b;
};
Blockly.Blocks.sound_volume_change = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_change_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_change_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.change_volume_by_percent(%1)"]}};
Entry.block.sound_volume_change = function(a, b) {
  a = b.getNumberValue("VALUE", b) / 100;
  a += createjs.Sound.getVolume();
  1 < a && (a = 1);
  0 > a && (a = 0);
  createjs.Sound.setVolume(a);
  return b.callReturn();
};
Blockly.Blocks.sound_volume_set = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_set_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_set_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.set_volume_by_percent(%1)"]}};
Entry.block.sound_volume_set = function(a, b) {
  a = b.getNumberValue("VALUE", b) / 100;
  1 < a && (a = 1);
  0 > a && (a = 0);
  createjs.Sound.setVolume(a);
  return b.callReturn();
};
Blockly.Blocks.sound_silent_all = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_silent_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.stop_all_sounds()"]}};
Entry.block.sound_silent_all = function(a, b) {
  createjs.Sound.stop();
  return b.callReturn();
};
Blockly.Blocks.get_sounds = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.get_sounds = function(a, b) {
  return b.getStringField("VALUE");
};
Blockly.Blocks.sound_something_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound(%1)"]}};
Entry.block.sound_something_with_block = function(a, b) {
  var d = b.getStringValue("VALUE", b);
  (a = a.parent.getSound(d)) && createjs.Sound.play(a.id);
  return b.callReturn();
};
Blockly.Blocks.sound_something_second_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(" ").appendField(Lang.Blocks.SOUND_sound_something_second_2);
  this.appendValueInput("SECOND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_for_seconds(%1, %2)"]}};
Entry.block.sound_something_second_with_block = function(a, b) {
  var d = b.getStringValue("VALUE", b), c = b.getNumberValue("SECOND", b);
  (a = a.parent.getSound(d)) && createjs.Sound.play(a.id, {startTime:0, duration:1E3 * c});
  return b.callReturn();
};
Blockly.Blocks.sound_something_wait_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_and_wait(%1)"]}};
Entry.block.sound_something_wait_with_block = function(a, b) {
  if (b.isPlay) {
    if (1 == b.playState) {
      return b;
    }
    delete b.playState;
    delete b.isPlay;
    return b.callReturn();
  }
  b.isPlay = !0;
  b.playState = 1;
  var d = b.getStringValue("VALUE", b);
  if (a = a.parent.getSound(d)) {
    createjs.Sound.play(a.id), setTimeout(function() {
      b.playState = 0;
    }, 1E3 * a.duration);
  }
  return b;
};
Blockly.Blocks.sound_something_second_wait_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_2).appendField(" ");
  this.appendValueInput("SECOND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_for_seconds_and_wait(%1, %2)"]}};
Entry.block.sound_something_second_wait_with_block = function(a, b) {
  if (b.isPlay) {
    if (1 == b.playState) {
      return b;
    }
    delete b.isPlay;
    delete b.playState;
    return b.callReturn();
  }
  b.isPlay = !0;
  b.playState = 1;
  var d = b.getStringValue("VALUE", b);
  if (a = a.parent.getSound(d)) {
    var c = createjs.Sound.play(a.id);
    a = b.getNumberValue("SECOND", b);
    setTimeout(function() {
      c.stop();
      b.playState = 0;
    }, 1E3 * a);
    c.addEventListener("complete", function(b) {
    });
  }
  return b;
};
Blockly.Blocks.sound_from_to = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_2);
  this.appendValueInput("START").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_3);
  this.appendValueInput("END").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_from_to_seconds(%1, %2, %3)"]}};
Entry.block.sound_from_to = function(a, b) {
  var d = b.getStringValue("VALUE", b);
  if (a = a.parent.getSound(d)) {
    var d = 1E3 * b.getNumberValue("START", b), c = 1E3 * b.getNumberValue("END", b);
    createjs.Sound.play(a.id, {startTime:Math.min(d, c), duration:Math.max(d, c) - Math.min(d, c)});
  }
  return b.callReturn();
};
Blockly.Blocks.sound_from_to_and_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_2);
  this.appendValueInput("START").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_3);
  this.appendValueInput("END").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_from_to_seconds_and_wait(%1, %2, %3)"]}};
Entry.block.sound_from_to_and_wait = function(a, b) {
  if (b.isPlay) {
    if (1 == b.playState) {
      return b;
    }
    delete b.isPlay;
    delete b.playState;
    return b.callReturn();
  }
  b.isPlay = !0;
  b.playState = 1;
  var d = b.getStringValue("VALUE", b);
  if (a = a.parent.getSound(d)) {
    var c = 1E3 * b.getNumberValue("START", b), e = 1E3 * b.getNumberValue("END", b), d = Math.min(c, e), c = Math.max(c, e) - d;
    createjs.Sound.play(a.id, {startTime:d, duration:c});
    setTimeout(function() {
      b.playState = 0;
    }, c);
  }
  return b;
};
Blockly.Blocks.when_run_button_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_play.png", "*", "start")).appendField(Lang.Blocks.START_when_run_button_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_start_button_click()"]}};
Entry.block.when_run_button_click = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.press_some_key = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_press_some_key_1).appendField(new Blockly.FieldDropdown([["q", "81"], ["w", "87"], ["e", "69"], ["r", "82"], ["a", "65"], ["s", "83"], ["d", "68"], [Lang.Blocks.START_press_some_key_up, "38"], [Lang.Blocks.START_press_some_key_down, "40"], [Lang.Blocks.START_press_some_key_left, "37"], [Lang.Blocks.START_press_some_key_right, "39"], [Lang.Blocks.START_press_some_key_enter, 
  "13"], [Lang.Blocks.START_press_some_key_space, "32"]]), "VALUE").appendField(Lang.Blocks.START_press_some_key_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.is_key_pressed()"]}};
Entry.block.press_some_key = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.when_some_key_pressed = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_press_some_key_1).appendField(new Blockly.FieldKeydownInput("81"), "VALUE").appendField(Lang.Blocks.START_press_some_key_2);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_key_press(%1)"]}};
Entry.block.when_some_key_pressed = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.mouse_clicked = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_mouse_clicked);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_mouse_click_down()"]}};
Entry.block.mouse_clicked = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.mouse_click_cancled = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_mouse_click_cancled);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_mouse_click_up()"]}};
Entry.block.mouse_click_cancled = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.when_object_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_when_object_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_object_click_down()"]}};
Entry.block.when_object_click = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.when_object_click_canceled = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_when_object_click_canceled);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_object_click_up()"]}};
Entry.block.when_object_click_canceled = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.when_some_key_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_when_some_key_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_key_press_down(%1)"]}};
Entry.block.when_some_key_click = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.when_message_cast = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_signal.png", "*", "start")).appendField(Lang.Blocks.START_when_message_cast_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_when_message_cast_2);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_signal_receive(%1)"]}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_messageRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_messageRefs", a);
}};
Entry.block.when_message_cast = function(a, b) {
  return b.callReturn();
};
Blockly.Blocks.message_cast = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_message_cast_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_message_cast_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.send_signal(%1)"]}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_messageRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_messageRefs", a);
}};
Entry.block.message_cast = function(a, b) {
  a = b.getField("VALUE", b);
  var d = Entry.isExist(a, "id", Entry.variableContainer.messages_);
  if ("null" == a || !d) {
    throw Error("value can not be null or undefined");
  }
  Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["when_message_cast", a]);
  return b.callReturn();
};
Blockly.Blocks.message_cast_wait = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_message_send_wait_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_message_send_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.send_signal_and_wait(%1)"]}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_messageRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_messageRefs", a);
}};
Entry.block.message_cast_wait = function(a, b) {
  if (b.runningScript) {
    a = b.runningScript;
    for (var d = a.length, c = 0;c < d;c++) {
      var e = a.shift();
      e && !e.isEnd() && a.push(e);
    }
    return a.length ? b : b.callReturn();
  }
  a = b.getField("VALUE", b);
  e = Entry.isExist(a, "id", Entry.variableContainer.messages_);
  if ("null" == a || !e) {
    throw Error("value can not be null or undefined");
  }
  d = Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["when_message_cast", a]);
  for (a = [];d.length;) {
    (e = d.shift()) && (a = a.concat(e));
  }
  b.runningScript = a;
  return b;
};
var colour = "#FFCA36";
Blockly.Blocks.text = {init:function() {
  this.setColour("#FFD974");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.TEXT_text), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["%1"]}};
Entry.block.text = function(a, b) {
  return b.getField("NAME", b);
};
Blockly.Blocks.text_write = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_write_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_write_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_write = function(a, b) {
  var d = b.getStringValue("VALUE", b), d = Entry.convertToRoundedDecimals(d, 3);
  a.setText(d);
  return b.callReturn();
};
Blockly.Blocks.text_append = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_append_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_append_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_append = function(a, b) {
  var d = b.getStringValue("VALUE", b);
  a.setText(Entry.convertToRoundedDecimals(a.getText(), 3) + Entry.convertToRoundedDecimals(d, 3));
  return b.callReturn();
};
Blockly.Blocks.text_prepend = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_prepend_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_prepend_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_prepend = function(a, b) {
  var d = b.getStringValue("VALUE", b);
  a.setText(Entry.convertToRoundedDecimals(d, 3) + Entry.convertToRoundedDecimals(a.getText(), 3));
  return b.callReturn();
};
Blockly.Blocks.text_flush = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_flush);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_flush = function(a, b) {
  a.setText("");
  return b.callReturn();
};
Entry.block.variableAddButton = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ubcc0\uc218 \ucd94\uac00", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  Entry.variableContainer.openVariableAddPanel("variable");
}]}, syntax:{js:[], py:[]}};
Entry.block.listAddButton = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub9ac\uc2a4\ud2b8 \ucd94\uac00", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  Entry.variableContainer.openVariableAddPanel("list");
}]}, syntax:{js:[], py:[]}};
Blockly.Blocks.change_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_variableRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_variableRefs", a);
}};
Entry.block.change_variable = function(a, b) {
  var d = b.getField("VARIABLE", b), c = b.getNumberValue("VALUE", b), c = Entry.parseNumber(c);
  if (0 == c && "boolean" == typeof c) {
    throw Error("Type is not correct");
  }
  d = Entry.variableContainer.getVariable(d, a);
  a = Entry.getMaxFloatPoint([c, d.getValue()]);
  d.setValue((c + d.getValue()).toFixed(a));
  return b.callReturn();
};
Blockly.Blocks.set_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_variableRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_variableRefs", a);
}};
Entry.block.set_variable = function(a, b) {
  var d = b.getField("VARIABLE", b), c = b.getValue("VALUE", b);
  Entry.variableContainer.getVariable(d, a).setValue(c);
  return b.callReturn();
};
Blockly.Blocks.show_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_show_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_show_variable_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_variableRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_variableRefs", a);
}};
Entry.block.show_variable = function(a, b) {
  var d = b.getField("VARIABLE", b);
  a = Entry.variableContainer.getVariable(d, a);
  a.setVisible(!0);
  a.updateView();
  return b.callReturn();
};
Blockly.Blocks.hide_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_hide_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_hide_variable_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_variableRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_variableRefs", a);
}};
Entry.block.hide_variable = function(a, b) {
  var d = b.getField("VARIABLE", b);
  Entry.variableContainer.getVariable(d, a).setVisible(!1);
  return b.callReturn();
};
Blockly.Blocks.get_y = {init:function() {
  this.setColour(230);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_y).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setOutput(!0, "Number");
}};
Blockly.Blocks.get_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_get_variable_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_variableRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_variableRefs", a);
}};
Entry.block.get_variable = function(a, b) {
  b = b.getField("VARIABLE", b);
  return Entry.variableContainer.getVariable(b, a).getValue();
};
Blockly.Blocks.ask_and_wait = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_ask_and_wait_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_ask_and_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(a) {
  Entry.container && Entry.container.hideProjectAnswer(a);
}, syntax:{js:[], py:["Entry.ask_and_wait(%1)\n"]}};
Entry.block.ask_and_wait = function(a, b) {
  var d = Entry.container.inputValue, c = Entry.stage.inputField, e = b.getValue("VALUE", b);
  if (!e) {
    throw Error("message can not be empty");
  }
  if (d.sprite == a && c && !c._isHidden) {
    return b;
  }
  if (d.sprite != a && b.isInit) {
    return a.dialog && a.dialog.remove(), delete b.isInit, b.callReturn();
  }
  if (d.complete && d.sprite == a && c._isHidden && b.isInit) {
    return a.dialog && a.dialog.remove(), delete d.complete, delete b.isInit, b.callReturn();
  }
  e = Entry.convertToRoundedDecimals(e, 3);
  new Entry.Dialog(a, e, "speak");
  Entry.stage.showInputField();
  d.script = b;
  d.sprite = a;
  b.isInit = !0;
  return b;
};
Blockly.Blocks.get_canvas_input_value = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_canvas_input_value, "#fff");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(a) {
  Entry.container && Entry.container.hideProjectAnswer(a);
}, syntax:{js:[], py:["answer"]}};
Entry.block.get_canvas_input_value = function(a, b) {
  return Entry.container.getInputValue();
};
Blockly.Blocks.add_value_to_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(a) {
  var b = Entry.variableContainer;
  b && b.addRef("_variableRefs", a);
}, whenRemove:function(a) {
  var b = Entry.variableContainer;
  b && b.removeRef("_variableRefs", a);
}};
Entry.block.add_value_to_list = function(a, b) {
  var d = b.getField("LIST", b), c = b.getValue("VALUE", b);
  a = Entry.variableContainer.getList(d, a);
  a.array_ || (a.array_ = []);
  a.array_.push({data:c});
  a.updateView();
  return b.callReturn();
};
Blockly.Blocks.remove_value_from_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.remove_value_from_list = function(a, b) {
  var d = b.getField("LIST", b), c = b.getValue("VALUE", b);
  a = Entry.variableContainer.getList(d, a);
  if (!a.array_ || isNaN(c) || c > a.array_.length) {
    throw Error("can not remove value from array");
  }
  a.array_.splice(c - 1, 1);
  a.updateView();
  return b.callReturn();
};
Blockly.Blocks.insert_value_to_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_1);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_3);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.insert_value_to_list = function(a, b) {
  var d = b.getField("LIST", b), c = b.getValue("DATA", b), e = b.getValue("INDEX", b);
  a = Entry.variableContainer.getList(d, a);
  if (!a.array_ || isNaN(e) || 0 == e || e > a.array_.length + 1) {
    throw Error("can not insert value to array");
  }
  a.array_.splice(e - 1, 0, {data:c});
  a.updateView();
  return b.callReturn();
};
Blockly.Blocks.change_value_list_index = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_2);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_3);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_value_list_index = function(a, b) {
  var d = b.getField("LIST", b), c = b.getValue("DATA", b), e = b.getValue("INDEX", b);
  a = Entry.variableContainer.getList(d, a);
  if (!a.array_ || isNaN(e) || e > a.array_.length) {
    throw Error("can not insert value to array");
  }
  a.array_[e - 1].data = c;
  a.updateView();
  return b.callReturn();
};
Blockly.Blocks.value_of_index_from_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_2);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_3);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.value_of_index_from_list = function(a, b) {
  var d = b.getField("LIST", b);
  b = b.getValue("INDEX", b);
  a = Entry.variableContainer.getList(d, a);
  b = Entry.getListRealIndex(b, a);
  if (!a.array_ || isNaN(b) || b > a.array_.length) {
    throw Error("can not insert value to array");
  }
  return a.array_[b - 1].data;
};
Blockly.Blocks.length_of_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_length_of_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_length_of_list_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.length_of_list = function(a, b) {
  a = b.getField("LIST", b);
  return Entry.variableContainer.getList(a).array_.length;
};
Blockly.Blocks.show_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_show_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST").appendField(Lang.Blocks.VARIABLE_show_list_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.show_list = function(a, b) {
  a = b.getField("LIST", b);
  Entry.variableContainer.getList(a).setVisible(!0);
  return b.callReturn();
};
Blockly.Blocks.hide_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_hide_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST").appendField(Lang.Blocks.VARIABLE_hide_list_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hide_list = function(a, b) {
  a = b.getField("LIST", b);
  Entry.variableContainer.getList(a).setVisible(!1);
  return b.callReturn();
};
Blockly.Blocks.options_for_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField("");
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([[Lang.Blocks.VARIABLE_list_option_first, "FIRST"], [Lang.Blocks.VARIABLE_list_option_last, "LAST"], [Lang.Blocks.VARIABLE_list_option_random, "RANDOM"]]), "OPERATOR");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.options_for_list = function(a, b) {
  return b.getField("OPERATOR", b);
};
Blockly.Blocks.set_visible_answer = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_canvas_input_value);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_timer_visible_show, "SHOW"], [Lang.Blocks.CALC_timer_visible_hide, "HIDE"]]), "BOOL");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(a) {
  Entry.container && Entry.container.hideProjectAnswer(a);
}, syntax:{js:[], py:['Entry.set_visible("%1")\n']}};
Entry.block.set_visible_answer = function(a, b) {
  "HIDE" == b.getField("BOOL", b) ? Entry.container.inputValue.setVisible(!1) : Entry.container.inputValue.setVisible(!0);
  return b.callReturn();
};
Blockly.Blocks.is_included_in_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_2);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_3);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.is_included_in_list = function(a, b) {
  a = b.getField("LIST", b);
  b = b.getStringValue("DATA", b);
  a = Entry.variableContainer.getList(a);
  if (!a) {
    return !1;
  }
  a = a.array_;
  for (var d = 0, c = a.length;d < c;d++) {
    if (a[d].data.toString() == b.toString()) {
      return !0;
    }
  }
  return !1;
};
Entry.Xbot = {PORT_MAP:{rightWheel:0, leftWheel:0, head:90, armR:90, armL:90, analogD5:127, analogD6:127, D4:0, D7:0, D12:0, D13:0, ledR:0, ledG:0, ledB:0, lcdNum:0, lcdTxt:"                ", note:262, duration:0}, setZero:function() {
  var a = Entry.Xbot.PORT_MAP, b = Entry.hw.sendQueue, d;
  for (d in a) {
    b[d] = a[d];
  }
  Entry.hw.update();
  Entry.Xbot.removeAllTimeouts();
}, timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}, name:"xbot_epor_edge"};
Blockly.Blocks.xbot_digitalInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_D2_digitalInput, "D2"], [Lang.Blocks.XBOT_D3_digitalInput, "D3"], [Lang.Blocks.XBOT_D11_digitalInput, "D11"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.xbot_digitalInput = function(a, b) {
  a = Entry.hw.portData;
  b = b.getField("DEVICE");
  return a[b];
};
Blockly.Blocks.xbot_analogValue = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_CDS, "light"], [Lang.Blocks.XBOT_MIC, "mic"], [Lang.Blocks.XBOT_analog0, "adc0"], [Lang.Blocks.XBOT_analog1, "adc1"], [Lang.Blocks.XBOT_analog2, "adc2"], [Lang.Blocks.XBOT_analog3, "adc3"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.xbot_analogValue = function(a, b) {
  a = Entry.hw.portData;
  b = b.getField("DEVICE");
  return a[b];
};
Blockly.Blocks.xbot_digitalOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_digital).appendField(new Blockly.FieldDropdown([["LED", "D13"], ["D4", "D4"], ["D7", "D7"], ["D12 ", "D12"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_OutputValue).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_High, "HIGH"], [Lang.Blocks.XBOT_Low, "LOW"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_digitalOutput = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getStringField("DEVICE", b), c = b.getStringField("VALUE", b);
  a.D13 = "D13" == d && "HIGH" == c ? 1 : 0;
  a.D4 = "D4" == d && "HIGH" == c ? 1 : 0;
  a.D7 = "D7" == d && "HIGH" == c ? 1 : 0;
  a.D12 = "D12" == d && "HIGH" == c ? 1 : 0;
  return b.callReturn();
};
Blockly.Blocks.xbot_analogOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_analog).appendField(new Blockly.FieldDropdown([["D5", "analogD5"], ["D6", "analogD6"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_Output_Value);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_analogOutput = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getStringField("DEVICE", b), c = b.getNumberValue("VALUE", b);
  "analogD5" == d ? a.analogD5 = c : "analogD6" == d && (a.analogD6 = c);
  return b.callReturn();
};
Blockly.Blocks.xbot_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_Servo).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_Head, "head"], [Lang.Blocks.XBOT_ArmR, "right"], [Lang.Blocks.XBOT_ArmL, "left"]]), "DEVICE").appendField(Lang.Blocks.XBOT_angle);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_servo = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getStringField("DEVICE", b), c = b.getNumberValue("VALUE", b);
  "head" == d ? a.head = c : "right" == d ? a.armR = c : "left" == d && (a.armL = c);
  return b.callReturn();
};
Blockly.Blocks.xbot_oneWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_DC).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_rightWheel, "rightWheel"], [Lang.Blocks.XBOT_leftWheel, "leftWheel"], [Lang.Blocks.XBOT_bothWheel, "bothWheel"]]), "DEVICE").appendField(Lang.Blocks.XBOT_speed);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_oneWheel = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getStringField("DEVICE", b), c = b.getNumberValue("VALUE", b);
  "rightWheel" == d ? a.rightWheel = c : "leftWheel" == d ? a.leftWheel = c : a.rightWheel = a.leftWheel = c;
  return b.callReturn();
};
Blockly.Blocks.xbot_twoWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_rightSpeed);
  this.appendValueInput("rightWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_leftSpeed);
  this.appendValueInput("leftWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_twoWheel = function(a, b) {
  a = Entry.hw.sendQueue;
  a.rightWheel = b.getNumberValue("rightWheel");
  a.leftWheel = b.getNumberValue("leftWheel");
  return b.callReturn();
};
Blockly.Blocks.xbot_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_R);
  this.appendValueInput("ledR").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_G);
  this.appendValueInput("ledG").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_B);
  this.appendValueInput("ledB").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb = function(a, b) {
  a = Entry.hw.sendQueue;
  a.ledR = b.getNumberValue("ledR");
  a.ledG = b.getNumberValue("ledG");
  a.ledB = b.getNumberValue("ledB");
  return b.callReturn();
};
Blockly.Blocks.xbot_rgb_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_color).appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField(Lang.Blocks.XBOT_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb_picker = function(a, b) {
  a = b.getStringField("VALUE");
  var d = Entry.hw.sendQueue;
  d.ledR = parseInt(.3 * parseInt(a.substr(1, 2), 16));
  d.ledG = parseInt(.3 * parseInt(a.substr(3, 2), 16));
  d.ledB = parseInt(.3 * parseInt(a.substr(5, 2), 16));
  return b.callReturn();
};
Blockly.Blocks.xbot_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_c, "C"], [Lang.Blocks.XBOT_d, "D"], [Lang.Blocks.XBOT_e, "E"], [Lang.Blocks.XBOT_f, "F"], [Lang.Blocks.XBOT_g, "G"], [Lang.Blocks.XBOT_a, "A"], [Lang.Blocks.XBOT_b, "B"]]), "NOTE").appendField(" ").appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_melody_ms).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_buzzer = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getStringField("NOTE", b), c = b.getStringField("OCTAVE", b), e = b.getNumberValue("VALUE", b), d = d + c;
  a.note = "C2" == d ? 65 : "D2" == d ? 73 : "E2" == d ? 82 : "F2" == d ? 87 : "G2" == d ? 98 : "A2" == d ? 110 : "B2" == d ? 123 : "C3" == d ? 131 : "D3" == d ? 147 : "E3" == d ? 165 : "F3" == d ? 175 : "G3" == d ? 196 : "A3" == d ? 220 : "B3" == d ? 247 : "C4" == d ? 262 : "D4" == d ? 294 : "E4" == d ? 330 : "F4" == d ? 349 : "G4" == d ? 392 : "A4" == d ? 440 : "B4" == d ? 494 : "C5" == d ? 523 : "D5" == d ? 587 : "E5" == d ? 659 : "F5" == d ? 698 : "G5" == d ? 784 : "A5" == d ? 880 : "B5" == d ? 
  988 : "C6" == d ? 1047 : "D6" == d ? 1175 : "E6" == d ? 1319 : "F6" == d ? 1397 : "G6" == d ? 1568 : "A6" == d ? 1760 : "B6" == d ? 1976 : "C7" == d ? 2093 : "D7" == d ? 2349 : "E7" == d ? 2637 : "F7" == d ? 2794 : "G7" == d ? 3136 : "A7" == d ? 3520 : "B7" == d ? 3951 : 262;
  a.duration = 40 * e;
  return b.callReturn();
};
Blockly.Blocks.xbot_lcd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LCD").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "LINE").appendField(Lang.Blocks.XBOT_Line).appendField(", ").appendField(Lang.Blocks.XBOT_outputValue);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_lcd = function(a, b) {
  a = Entry.hw.sendQueue;
  var d = b.getNumberField("LINE", b), c = b.getStringValue("VALUE", b);
  0 == d ? (a.lcdNum = 0, a.lcdTxt = c) : 1 == d && (a.lcdNum = 1, a.lcdTxt = c);
  return b.callReturn();
};
Entry.Collection = function(a) {
  this.length = 0;
  this._hashMap = {};
  this._observers = [];
  this.set(a);
};
(function(a, b) {
  a.set = function(a) {
    for (;this.length;) {
      b.pop.call(this);
    }
    var c = this._hashMap, e;
    for (e in c) {
      delete c[e];
    }
    if (void 0 !== a) {
      e = 0;
      for (var f = a.length;e < f;e++) {
        var g = a[e];
        c[g.id] = g;
        b.push.call(this, g);
      }
    }
  };
  a.push = function(a) {
    this._hashMap[a.id] = a;
    b.push.call(this, a);
  };
  a.unshift = function() {
    for (var a = Array.prototype.slice.call(arguments, 0), c = this._hashMap, e = a.length - 1;0 <= e;e--) {
      var f = a[e];
      b.unshift.call(this, f);
      c[f.id] = f;
    }
  };
  a.insert = function(a, c) {
    b.splice.call(this, c, 0, a);
    this._hashMap[a.id] = a;
  };
  a.has = function(b) {
    return !!this._hashMap[b];
  };
  a.get = function(b) {
    return this._hashMap[b];
  };
  a.at = function(b) {
    return this[b];
  };
  a.getAll = function() {
    for (var b = this.length, a = [], e = 0;e < b;e++) {
      a.push(this[e]);
    }
    return a;
  };
  a.indexOf = function(a) {
    return b.indexOf.call(this, a);
  };
  a.find = function(b) {
    for (var a = [], e, f = 0, g = this.length;f < g;f++) {
      e = !0;
      var h = this[f], k;
      for (k in b) {
        if (b[k] != h[k]) {
          e = !1;
          break;
        }
      }
      e && a.push(h);
    }
    return a;
  };
  a.pop = function() {
    var a = b.pop.call(this);
    delete this._hashMap[a.id];
    return a;
  };
  a.shift = function() {
    var a = b.shift.call(this);
    delete this._hashMap[a.id];
    return a;
  };
  a.slice = function(a, c) {
    a = b.slice.call(this, a, c);
    c = this._hashMap;
    for (var e in a) {
      delete c[a[e].id];
    }
    return a;
  };
  a.remove = function(b) {
    var a = this.indexOf(b);
    -1 < a && (delete this._hashMap[b.id], this.splice(a, 1));
  };
  a.splice = function(a, c) {
    var e = b.slice.call(arguments, 2), f = this._hashMap;
    c = void 0 === c ? this.length - a : c;
    for (var g = b.splice.call(this, a, c), h = 0, k = g.length;h < k;h++) {
      delete f[g[h].id];
    }
    h = 0;
    for (k = e.length;h < k;h++) {
      f = e[h], b.splice.call(this, a++, 0, f), this._hashMap[f.id] = f;
    }
    return g;
  };
  a.clear = function() {
    for (;this.length;) {
      b.pop.call(this);
    }
    this._hashMap = {};
  };
  a.map = function(b, a) {
    for (var e = [], f = 0, g = this.length;f < g;f++) {
      e.push(b(this[f], a));
    }
    return e;
  };
  a.moveFromTo = function(a, c) {
    var e = this.length - 1;
    0 > a || 0 > c || a > e || c > e || b.splice.call(this, c, 0, b.splice.call(this, a, 1)[0]);
  };
  a.sort = function() {
  };
  a.fromJSON = function() {
  };
  a.toJSON = function() {
    for (var b = [], a = 0, e = this.length;a < e;a++) {
      b.push(this[a].toJSON());
    }
    return b;
  };
  a.observe = function() {
  };
  a.unobserve = function() {
  };
  a.notify = function() {
  };
  a.destroy = function() {
  };
})(Entry.Collection.prototype, Array.prototype);
Entry.Event = function(a) {
  this._sender = a;
  this._listeners = [];
};
(function(a) {
  a.attach = function(b, a) {
    var c = this;
    b = {obj:b, fn:a, destroy:function() {
      c.detach(this);
    }};
    this._listeners.push(b);
    return b;
  };
  a.detach = function(b) {
    var a = this._listeners;
    b = a.indexOf(b);
    if (-1 < b) {
      return a.splice(b, 1);
    }
  };
  a.clear = function() {
    for (var b = this._listeners;b.length;) {
      b.pop();
    }
  };
  a.notify = function() {
    var b = arguments;
    this._listeners.slice().forEach(function(a) {
      a.fn.apply(a.obj, b);
    });
  };
})(Entry.Event.prototype);
Entry.Utils = {};
Entry.overridePrototype = function() {
  Number.prototype.mod = function(a) {
    return (this % a + a) % a;
  };
};
Entry.Utils.generateId = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.Utils.intersectArray = function(a, b) {
  for (var d = [], c = 0;c < a.length;c++) {
    for (var e = 0;e < b.length;e++) {
      if (a[c] == b[e]) {
        d.push(a[c]);
        break;
      }
    }
  }
  return d;
};
Entry.Utils.isPointInMatrix = function(a, b, d) {
  d = void 0 === d ? 0 : d;
  var c = a.offsetX ? a.x + a.offsetX : a.x, e = a.offsetY ? a.y + a.offsety : a.y;
  return c - d <= b.x && c + a.width + d >= b.x && e - d <= b.y && e + a.height + d >= b.y;
};
Entry.Utils.colorDarken = function(a, b) {
  function d(b) {
    2 != b.length && (b = "0" + b);
    return b;
  }
  var c, e;
  7 === a.length ? (c = parseInt(a.substr(1, 2), 16), e = parseInt(a.substr(3, 2), 16), a = parseInt(a.substr(5, 2), 16)) : (c = parseInt(a.substr(1, 2), 16), e = parseInt(a.substr(2, 2), 16), a = parseInt(a.substr(3, 2), 16));
  b = void 0 === b ? .7 : b;
  c = d(Math.floor(c * b).toString(16));
  e = d(Math.floor(e * b).toString(16));
  a = d(Math.floor(a * b).toString(16));
  return "#" + c + e + a;
};
Entry.Utils.colorLighten = function(a, b) {
  b = 0 === b ? 0 : b || 20;
  a = Entry.Utils.hexToHsl(a);
  a.l += b / 100;
  a.l = Math.min(1, Math.max(0, a.l));
  return Entry.Utils.hslToHex(a);
};
Entry.Utils.bound01 = function(a, b) {
  var d = a;
  "string" == typeof d && -1 != d.indexOf(".") && 1 === parseFloat(d) && (a = "100%");
  d = "string" === typeof a && -1 != a.indexOf("%");
  a = Math.min(b, Math.max(0, parseFloat(a)));
  d && (a = parseInt(a * b, 10) / 100);
  return 1E-6 > Math.abs(a - b) ? 1 : a % b / parseFloat(b);
};
Entry.Utils.hexToHsl = function(a) {
  var b, d;
  7 === a.length ? (b = parseInt(a.substr(1, 2), 16), d = parseInt(a.substr(3, 2), 16), a = parseInt(a.substr(5, 2), 16)) : (b = parseInt(a.substr(1, 2), 16), d = parseInt(a.substr(2, 2), 16), a = parseInt(a.substr(3, 2), 16));
  b = Entry.Utils.bound01(b, 255);
  d = Entry.Utils.bound01(d, 255);
  a = Entry.Utils.bound01(a, 255);
  var c = Math.max(b, d, a), e = Math.min(b, d, a), f, g = (c + e) / 2;
  if (c == e) {
    f = e = 0;
  } else {
    var h = c - e, e = .5 < g ? h / (2 - c - e) : h / (c + e);
    switch(c) {
      case b:
        f = (d - a) / h + (d < a ? 6 : 0);
        break;
      case d:
        f = (a - b) / h + 2;
        break;
      case a:
        f = (b - d) / h + 4;
    }
    f /= 6;
  }
  return {h:360 * f, s:e, l:g};
};
Entry.Utils.hslToHex = function(a) {
  function b(b, a, d) {
    0 > d && (d += 1);
    1 < d && --d;
    return d < 1 / 6 ? b + 6 * (a - b) * d : .5 > d ? a : d < 2 / 3 ? b + (a - b) * (2 / 3 - d) * 6 : b;
  }
  function d(b) {
    return 1 == b.length ? "0" + b : "" + b;
  }
  var c, e;
  e = Entry.Utils.bound01(a.h, 360);
  c = Entry.Utils.bound01(a.s, 1);
  a = Entry.Utils.bound01(a.l, 1);
  if (0 === c) {
    c = a = e = a;
  } else {
    var f = .5 > a ? a * (1 + c) : a + c - a * c, g = 2 * a - f;
    c = b(g, f, e + 1 / 3);
    a = b(g, f, e);
    e = b(g, f, e - 1 / 3);
  }
  a *= 255;
  e *= 255;
  return "#" + [d(Math.round(255 * c).toString(16)), d(Math.round(a).toString(16)), d(Math.round(e).toString(16))].join("");
};
Entry.Utils.bindGlobalEvent = function(a) {
  var b = $(document);
  void 0 === a && (a = "resize mousedown mousemove keydown keyup dispose".split(" "));
  -1 < a.indexOf("resize") && (Entry.windowReszied && ($(window).off("resize"), Entry.windowReszied.clear()), Entry.windowResized = new Entry.Event(window), $(window).on("resize", function(b) {
    Entry.windowResized.notify(b);
  }));
  -1 < a.indexOf("mousedown") && (Entry.documentMousedown && (b.off("mousedown"), Entry.documentMousedown.clear()), Entry.documentMousedown = new Entry.Event(window), b.on("mousedown", function(b) {
    Entry.documentMousedown.notify(b);
  }));
  -1 < a.indexOf("mousemove") && (Entry.documentMousemove && (b.off("touchmove mousemove"), Entry.documentMousemove.clear()), Entry.mouseCoordinate = {}, Entry.documentMousemove = new Entry.Event(window), b.on("touchmove mousemove", function(b) {
    b.originalEvent && b.originalEvent.touches && (b = b.originalEvent.touches[0]);
    Entry.documentMousemove.notify(b);
    Entry.mouseCoordinate.x = b.clientX;
    Entry.mouseCoordinate.y = b.clientY;
  }));
  -1 < a.indexOf("keydown") && (Entry.keyPressed && (b.off("keydown"), Entry.keyPressed.clear()), Entry.pressedKeys = [], Entry.keyPressed = new Entry.Event(window), b.on("keydown", function(b) {
    var a = b.keyCode;
    0 > Entry.pressedKeys.indexOf(a) && Entry.pressedKeys.push(a);
    Entry.keyPressed.notify(b);
  }));
  -1 < a.indexOf("keyup") && (Entry.keyUpped && (b.off("keyup"), Entry.keyUpped.clear()), Entry.keyUpped = new Entry.Event(window), b.on("keyup", function(b) {
    var a = Entry.pressedKeys.indexOf(b.keyCode);
    -1 < a && Entry.pressedKeys.splice(a, 1);
    Entry.keyUpped.notify(b);
  }));
  -1 < a.indexOf("dispose") && (Entry.disposeEvent && Entry.disposeEvent.clear(), Entry.disposeEvent = new Entry.Event(window), Entry.documentMousedown && Entry.documentMousedown.attach(this, function(b) {
    Entry.disposeEvent.notify(b);
  }));
};
Entry.Utils.makeActivityReporter = function() {
  Entry.activityReporter = new Entry.ActivityReporter;
  return Entry.activityReporter;
};
Entry.Utils.initEntryEvent_ = function() {
  Entry.events_ || (Entry.events_ = []);
};
Entry.sampleColours = [];
Entry.assert = function(a, b) {
  if (!a) {
    throw Error(b || "Assert failed");
  }
};
Entry.parseTexttoXML = function(a) {
  var b;
  window.ActiveXObject ? (b = new ActiveXObject("Microsoft.XMLDOM"), b.async = "false", b.loadXML(a)) : b = (new DOMParser).parseFromString(a, "text/xml");
  return b;
};
Entry.createElement = function(a, b) {
  a = document.createElement(a);
  b && (a.id = b);
  a.hasClass = function(b) {
    return this.className.match(new RegExp("(\\s|^)" + b + "(\\s|$)"));
  };
  a.addClass = function(b) {
    for (var a = 0;a < arguments.length;a++) {
      b = arguments[a], this.hasClass(b) || (this.className += " " + b);
    }
  };
  a.removeClass = function(b) {
    for (var a = 0;a < arguments.length;a++) {
      b = arguments[a], this.hasClass(b) && (this.className = this.className.replace(new RegExp("(\\s|^)" + b + "(\\s|$)"), " "));
    }
  };
  a.bindOnClick = function(b) {
    $(this).on("click tab", function(a) {
      a.stopImmediatePropagation();
      b.call(this, a);
    });
  };
  return a;
};
Entry.makeAutolink = function(a) {
  return a ? a.replace(/(http|https|ftp|telnet|news|irc):\/\/([-/.a-zA-Z0-9_~#%$?&=:200-377()][^)\]}]+)/gi, "<a href='$1://$2' target='_blank'>$1://$2</a>").replace(/([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+.[a-z0-9-]+)/gi, "<a href='mailto:$1'>$1</a>") : "";
};
Entry.generateHash = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.addEventListener = function(a, b) {
  this.events_ || (this.events_ = {});
  this.events_[a] || (this.events_[a] = []);
  b instanceof Function && this.events_[a].push(b);
  return !0;
};
Entry.dispatchEvent = function(a, b) {
  this.events_ || (this.events_ = {});
  if (this.events_[a]) {
    for (var d = 0, c = this.events_[a].length;d < c;d++) {
      this.events_[a][d].call(window, b);
    }
  }
};
Entry.removeEventListener = function(a, b) {
  if (this.events_[a]) {
    for (var d = 0, c = this.events_[a].length;d < c;d++) {
      if (this.events_[a][d] === b) {
        this.events_[a].splice(d, 1);
        break;
      }
    }
  }
};
Entry.removeAllEventListener = function(a) {
  this.events_ && this.events_[a] && delete this.events_[a];
};
Entry.addTwoNumber = function(a, b) {
  if (isNaN(a) || isNaN(b)) {
    return a + b;
  }
  a += "";
  b += "";
  var d = a.indexOf("."), c = b.indexOf("."), e = 0, f = 0;
  0 < d && (e = a.length - d - 1);
  0 < c && (f = b.length - c - 1);
  return 0 < e || 0 < f ? e >= f ? (parseFloat(a) + parseFloat(b)).toFixed(e) : (parseFloat(a) + parseFloat(b)).toFixed(f) : parseInt(a) + parseInt(b);
};
Entry.hex2rgb = function(a) {
  return (a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a)) ? {r:parseInt(a[1], 16), g:parseInt(a[2], 16), b:parseInt(a[3], 16)} : null;
};
Entry.rgb2hex = function(a, b, d) {
  return "#" + (16777216 + (a << 16) + (b << 8) + d).toString(16).slice(1);
};
Entry.generateRgb = function() {
  return {r:Math.floor(256 * Math.random()), g:Math.floor(256 * Math.random()), b:Math.floor(256 * Math.random())};
};
Entry.adjustValueWithMaxMin = function(a, b, d) {
  return a > d ? d : a < b ? b : a;
};
Entry.isExist = function(a, b, d) {
  for (var c = 0;c < d.length;c++) {
    if (d[c][b] == a) {
      return d[c];
    }
  }
  return !1;
};
Entry.getColourCodes = function() {
  return "transparent #660000 #663300 #996633 #003300 #003333 #003399 #000066 #330066 #660066 #FFFFFF #990000 #993300 #CC9900 #006600 #336666 #0033FF #000099 #660099 #990066 #000000 #CC0000 #CC3300 #FFCC00 #009900 #006666 #0066FF #0000CC #663399 #CC0099 #333333 #FF0000 #FF3300 #FFFF00 #00CC00 #009999 #0099FF #0000FF #9900CC #FF0099 #666666 #CC3333 #FF6600 #FFFF33 #00FF00 #00CCCC #00CCFF #3366FF #9933FF #FF00FF #999999 #FF6666 #FF6633 #FFFF66 #66FF66 #66CCCC #00FFFF #3399FF #9966FF #FF66FF #BBBBBB #FF9999 #FF9966 #FFFF99 #99FF99 #66FFCC #99FFFF #66CCff #9999FF #FF99FF #CCCCCC #FFCCCC #FFCC99 #FFFFCC #CCFFCC #99FFCC #CCFFFF #99CCFF #CCCCFF #FFCCFF".split(" ");
};
Entry.removeElement = function(a) {
  a && a.parentNode && a.parentNode.removeChild(a);
};
Entry.getElementsByClassName = function(a) {
  for (var b = [], d = document.getElementsByTagName("*"), c = 0;c < d.length;c++) {
    -1 < (" " + d[c].className + " ").indexOf(" " + a + " ") && b.push(d[c]);
  }
  return b;
};
Entry.parseNumber = function(a) {
  return "string" != typeof a || isNaN(Number(a)) ? "number" != typeof a || isNaN(Number(a)) ? !1 : a : Number(a);
};
Entry.countStringLength = function(a) {
  var b, d = 0;
  for (b = 0;b < a.length;b++) {
    255 < a.charCodeAt(b) ? d += 2 : d++;
  }
  return d;
};
Entry.cutStringByLength = function(a, b) {
  var d, c = 0;
  for (d = 0;c < b && d < a.length;d++) {
    255 < a.charCodeAt(d) ? c += 2 : c++;
  }
  return a.substr(0, d);
};
Entry.isChild = function(a, b) {
  if (!b) {
    for (;b.parentNode;) {
      if ((b = b.parentNode) == a) {
        return !0;
      }
    }
  }
  return !1;
};
Entry.launchFullScreen = function(a) {
  a.requestFullscreen ? a.requestFullscreen() : a.mozRequestFulScreen ? a.mozRequestFulScreen() : a.webkitRequestFullscreen ? a.webkitRequestFullscreen() : a.msRequestFullScreen && a.msRequestFullScreen();
};
Entry.exitFullScreen = function() {
  document.exitFullScreen ? document.exitFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
};
Entry.isPhone = function() {
  return !1;
};
Entry.getKeyCodeMap = function() {
  return {65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 32:Lang.Blocks.START_press_some_key_space, 37:Lang.Blocks.START_press_some_key_left, 38:Lang.Blocks.START_press_some_key_up, 39:Lang.Blocks.START_press_some_key_right, 40:Lang.Blocks.START_press_some_key_down, 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
  13:Lang.Blocks.START_press_some_key_enter};
};
Entry.checkCollisionRect = function(a, b) {
  return !(a.y + a.height < b.y || a.y > b.y + b.height || a.x + a.width < b.x || a.x > b.x + b.width);
};
Entry.bindAnimationCallback = function(a, b) {
  a.addEventListener("webkitAnimationEnd", b, !1);
  a.addEventListener("animationend", b, !1);
  a.addEventListener("oanimationend", b, !1);
};
Entry.cloneSimpleObject = function(a) {
  var b = {}, d;
  for (d in a) {
    b[d] = a[d];
  }
  return b;
};
Entry.nodeListToArray = function(a) {
  for (var b = Array(a.length), d = -1, c = a.length;++d !== c;b[d] = a[d]) {
  }
  return b;
};
Entry.computeInputWidth = function(a) {
  var b = document.createElement("span");
  b.className = "tmp-element";
  b.innerHTML = a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  document.body.appendChild(b);
  a = b.offsetWidth;
  document.body.removeChild(b);
  return Number(a + 10) + "px";
};
Entry.isArrowOrBackspace = function(a) {
  return -1 < [37, 38, 39, 40, 8].indexOf(a);
};
Entry.hexStringToBin = function(a) {
  for (var b = [], d = 0;d < a.length - 1;d += 2) {
    b.push(parseInt(a.substr(d, 2), 16));
  }
  return String.fromCharCode.apply(String, b);
};
Entry.findObjsByKey = function(a, b, d) {
  for (var c = [], e = 0;e < a.length;e++) {
    a[e][b] == d && c.push(a[e]);
  }
  return c;
};
Entry.factorials = [];
Entry.factorial = function(a) {
  return 0 === a || 1 == a ? 1 : 0 < Entry.factorials[a] ? Entry.factorials[a] : Entry.factorials[a] = Entry.factorial(a - 1) * a;
};
Entry.getListRealIndex = function(a, b) {
  if (isNaN(a)) {
    switch(a) {
      case "FIRST":
        a = 1;
        break;
      case "LAST":
        a = b.array_.length;
        break;
      case "RANDOM":
        a = Math.floor(Math.random() * b.array_.length) + 1;
    }
  }
  return a;
};
Entry.toRadian = function(a) {
  return a * Math.PI / 180;
};
Entry.toDegrees = function(a) {
  return 180 * a / Math.PI;
};
Entry.getPicturesJSON = function(a) {
  for (var b = [], d = 0, c = a.length;d < c;d++) {
    var e = a[d], f = {};
    f._id = e._id;
    f.id = e.id;
    f.dimension = e.dimension;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    f.scale = e.scale;
    b.push(f);
  }
  return b;
};
Entry.getSoundsJSON = function(a) {
  for (var b = [], d = 0, c = a.length;d < c;d++) {
    var e = a[d], f = {};
    f._id = e._id;
    f.duration = e.duration;
    f.ext = e.ext;
    f.id = e.id;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    b.push(f);
  }
  return b;
};
Entry.cutDecimal = function(a) {
  return Math.round(100 * a) / 100;
};
Entry.getBrowserType = function() {
  if (Entry.userAgent) {
    return Entry.userAgent;
  }
  var a = navigator.userAgent, b, d = a.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(d[1])) {
    return b = /\brv[ :]+(\d+)/g.exec(a) || [], "IE " + (b[1] || "");
  }
  if ("Chrome" === d[1] && (b = a.match(/\b(OPR|Edge)\/(\d+)/), null != b)) {
    return b.slice(1).join(" ").replace("OPR", "Opera");
  }
  d = d[2] ? [d[1], d[2]] : [navigator.appName, navigator.appVersion, "-?"];
  null != (b = a.match(/version\/(\d+)/i)) && d.splice(1, 1, b[1]);
  a = d.join(" ");
  return Entry.userAgent = a;
};
Entry.setBasicBrush = function(a) {
  var b = new createjs.Graphics;
  b.thickness = 1;
  b.rgb = Entry.hex2rgb("#ff0000");
  b.opacity = 100;
  b.setStrokeStyle(1);
  b.beginStroke("rgba(255,0,0,1)");
  var d = new createjs.Shape(b);
  Entry.stage.selectedObjectContainer.addChild(d);
  a.brush && (a.brush = null);
  a.brush = b;
  a.shape && (a.shape = null);
  a.shape = d;
};
Entry.setCloneBrush = function(a, b) {
  var d = new createjs.Graphics;
  d.thickness = b.thickness;
  d.rgb = b.rgb;
  d.opacity = b.opacity;
  d.setStrokeStyle(d.thickness);
  d.beginStroke("rgba(" + d.rgb.r + "," + d.rgb.g + "," + d.rgb.b + "," + d.opacity / 100 + ")");
  b = new createjs.Shape(d);
  Entry.stage.selectedObjectContainer.addChild(b);
  a.brush && (a.brush = null);
  a.brush = d;
  a.shape && (a.shape = null);
  a.shape = b;
};
Entry.isFloat = function(a) {
  return /\d+\.{1}\d+/.test(a);
};
Entry.getStringIndex = function(a) {
  if (!a) {
    return "";
  }
  for (var b = {string:a, index:1}, d = 0, c = [], e = a.length - 1;0 < e;--e) {
    var f = a.charAt(e);
    if (isNaN(f)) {
      break;
    } else {
      c.unshift(f), d = e;
    }
  }
  0 < d && (b.string = a.substring(0, d), b.index = parseInt(c.join("")) + 1);
  return b;
};
Entry.getOrderedName = function(a, b, d) {
  if (!a) {
    return "untitled";
  }
  if (!b || 0 === b.length) {
    return a;
  }
  d || (d = "name");
  for (var c = 0, e = Entry.getStringIndex(a), f = 0, g = b.length;f < g;f++) {
    var h = Entry.getStringIndex(b[f][d]);
    e.string === h.string && h.index > c && (c = h.index);
  }
  return 0 < c ? e.string + c : a;
};
Entry.changeXmlHashId = function(a) {
  if (/function_field/.test(a.getAttribute("type"))) {
    for (var b = a.getElementsByTagName("mutation"), d = 0, c = b.length;d < c;d++) {
      b[d].setAttribute("hashid", Entry.generateHash());
    }
  }
  return a;
};
Entry.getMaxFloatPoint = function(a) {
  for (var b = 0, d = 0, c = a.length;d < c;d++) {
    var e = String(a[d]), f = e.indexOf(".");
    -1 !== f && (e = e.length - (f + 1), e > b && (b = e));
  }
  return Math.min(b, 20);
};
Entry.convertToRoundedDecimals = function(a, b) {
  return isNaN(a) || !this.isFloat(a) ? a : Number(Math.round(a + "e" + b) + "e-" + b);
};
Entry.attachEventListener = function(a, b, d) {
  setTimeout(function() {
    a.addEventListener(b, d);
  }, 0);
};
Entry.deAttachEventListener = function(a, b, d) {
  a.removeEventListener(b, d);
};
Entry.isEmpty = function(a) {
  if (!a) {
    return !0;
  }
  for (var b in a) {
    if (a.hasOwnProperty(b)) {
      return !1;
    }
  }
  return !0;
};
Entry.Utils.disableContextmenu = function(a) {
  if (a) {
    $(a).on("contextmenu", function(b) {
      b.stopPropagation();
      b.preventDefault();
      return !1;
    });
  }
};
Entry.Utils.isRightButton = function(a) {
  return 2 == a.button || a.ctrlKey;
};
Entry.Utils.isTouchEvent = function(a) {
  return "mousedown" !== a.type.toLowerCase();
};
Entry.Utils.inherit = function(a, b) {
  function d() {
  }
  d.prototype = a.prototype;
  b.prototype = new d;
  return b;
};
Entry.bindAnimationCallbackOnce = function(a, b) {
  a.one("webkitAnimationEnd animationendo animationend", b);
};
Entry.Utils.isInInput = function(a) {
  return "textarea" == a.target.type || "text" == a.target.type;
};
Entry.Utils.isFunction = function(a) {
  return "function" === typeof a;
};
Entry.Utils.addFilters = function(a, b) {
  a = a.elem("defs");
  var d = a.elem("filter", {id:"entryTrashcanFilter_" + b});
  d.elem("feGaussianBlur", {"in":"SourceAlpha", stdDeviation:2, result:"blur"});
  d.elem("feOffset", {"in":"blur", dx:1, dy:1, result:"offsetBlur"});
  d = d.elem("feMerge");
  d.elem("feMergeNode", {"in":"offsetBlur"});
  d.elem("feMergeNode", {"in":"SourceGraphic"}, d);
  d = a.elem("filter", {id:"entryBlockShadowFilter_" + b, height:"200%"});
  d.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:1});
  d.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"0.7 0 0 0 0 0 0.7 0 0 0 0 0 0.7 0 0 0 0 0 1 0"});
  d.elem("feBlend", {in:"SourceGraphic", in1:"offOut", mode:"normal"});
  b = a.elem("filter", {id:"entryBlockHighlightFilter_" + b});
  b.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:0});
  b.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"1.3 0 0 0 0 0 1.3 0 0 0 0 0 1.3 0 0 0 0 0 1 0"});
};
Entry.Utils.addBlockPattern = function(a, b) {
  a = a.elem("pattern", {id:"blockHoverPattern_" + b, class:"blockHoverPattern", patternUnits:"userSpaceOnUse", patternTransform:"translate(12, 0)", x:0, y:0, width:125, height:33}).elem("g");
  b = a.elem("rect", {x:0, y:0, width:125, height:33});
  for (var d = Entry.mediaFilePath + "block_pattern_(order).png", c = 1;5 > c;c++) {
    a.elem("image", {class:"pattern" + c, href:d.replace("(order)", c), x:0, y:0, width:125, height:33});
  }
  return b;
};
Entry.Utils.COLLISION = {NONE:0, UP:1, RIGHT:2, LEFT:3, DOWN:4};
Entry.Utils.createMouseEvent = function(a, b) {
  var d = document.createEvent("MouseEvent");
  d.initMouseEvent(a, !0, !0, window, 0, 0, 0, b.clientX, b.clientY, !1, !1, !1, !1, 0, null);
  return d;
};
Entry.Utils.xmlToJsonData = function(a) {
  a = $.parseXML(a);
  var b = [];
  a = a.childNodes[0].childNodes;
  for (var d in a) {
    var c = a[d];
    if (c.tagName) {
      var e = {category:c.getAttribute("id"), blocks:[]}, c = c.childNodes;
      for (d in c) {
        var f = c[d];
        f.tagName && (f = f.getAttribute("type")) && e.blocks.push(f);
      }
      b.push(e);
    }
  }
  return b;
};
Entry.Utils.stopProjectWithToast = function(a, b) {
  b = b || "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec \ubc1c\uc0dd";
  Entry.toast && Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.check_runtime_error, !0);
  Entry.engine && Entry.engine.toggleStop();
  "workspace" === Entry.type && (Entry.container.selectObject(a.getCode().object.id), a.view.getBoard().activateBlock(a));
  throw Error(b);
};
Entry.Model = function(a, b) {
  var d = Entry.Model;
  d.generateSchema(a);
  d.generateSetter(a);
  d.generateObserve(a);
  (void 0 === b || b) && Object.seal(a);
  return a;
};
(function(a) {
  a.generateSchema = function(b) {
    var a = b.schema;
    if (void 0 !== a) {
      a = JSON.parse(JSON.stringify(a));
      b.data = {};
      for (var c in a) {
        (function(c) {
          b.data[c] = a[c];
          Object.defineProperty(b, c, {get:function() {
            return b.data[c];
          }});
        })(c);
      }
      b._toJSON = this._toJSON;
    }
  };
  a.generateSetter = function(b) {
    b.set = this.set;
  };
  a.set = function(b, a) {
    var c = {}, e;
    for (e in this.data) {
      void 0 !== b[e] && (b[e] === this.data[e] ? delete b[e] : (c[e] = this.data[e], this.data[e] = b[e] instanceof Array ? b[e].concat() : b[e]));
    }
    a || this.notify(Object.keys(b), c);
  };
  a.generateObserve = function(b) {
    b.observers = [];
    b.observe = this.observe;
    b.unobserve = this.unobserve;
    b.notify = this.notify;
  };
  a.observe = function(b, a, c, e) {
    c = new Entry.Observer(this.observers, b, a, c);
    if (!1 !== e) {
      b[a]([]);
    }
    return c;
  };
  a.unobserve = function(b) {
    b.destroy();
  };
  a.notify = function(b, a) {
    "string" === typeof b && (b = [b]);
    var c = this;
    c.observers.map(function(e) {
      var f = b;
      void 0 !== e.attrs && (f = Entry.Utils.intersectArray(e.attrs, b));
      if (f.length) {
        e.object[e.funcName](f.map(function(b) {
          return {name:b, object:c, oldValue:a[b]};
        }));
      }
    });
  };
  a._toJSON = function() {
    var b = {}, a;
    for (a in this.data) {
      b[a] = this.data[a];
    }
    return b;
  };
})(Entry.Model);
Entry.Observer = function(a, b, d, c) {
  this.parent = a;
  this.object = b;
  this.funcName = d;
  this.attrs = c;
  a.push(this);
};
(function(a) {
  a.destroy = function() {
    var b = this.parent, a = b.indexOf(this);
    -1 < a && b.splice(a, 1);
    return this;
  };
})(Entry.Observer.prototype);
Entry.Command = {};
Entry.Commander = function(a) {
  if ("workspace" == a || "phone" == a) {
    Entry.stateManager = new Entry.StateManager;
  }
  Entry.do = this.do.bind(this);
  Entry.undo = this.undo.bind(this);
  this.editor = {};
  Entry.Command.editor = this.editor;
};
(function(a) {
  a.do = function(b) {
    var a = Array.prototype.slice.call(arguments);
    a.shift();
    var c = Entry.Command[b];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.do, c.undo].concat(c.state.apply(this, a)));
    return {value:Entry.Command[b].do.apply(this, a), isPass:this.isPass.bind(this)};
  };
  a.undo = function() {
    var b = Array.prototype.slice.call(arguments), a = b.shift(), c = Entry.Command[a];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [a, this, this.do, c.undo].concat(c.state.apply(this, b)));
    return {value:Entry.Command[a].do.apply(this, b), isPass:this.isPass.bind(this)};
  };
  a.redo = function() {
    var b = Array.prototype.slice.call(arguments), a = b.shift(), c = Entry.Command[a];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [a, this, this.undo, a].concat(c.state.apply(null, b)));
    c.undo.apply(this, b);
  };
  a.setCurrentEditor = function(b, a) {
    this.editor[b] = a;
  };
  a.isPass = function(b) {
    b = void 0 === b ? !0 : b;
    if (Entry.stateManager) {
      var a = Entry.stateManager.getLastCommand();
      a && (a.isPass = b);
    }
  };
})(Entry.Commander.prototype);
(function(a) {
  a.addThread = {type:101, do:function(b) {
    return this.editor.board.code.createThread(b);
  }, state:function(b) {
    0 < b.length && (b[0].id = Entry.Utils.generateId());
    return [b];
  }, log:function(b) {
    return [b.id, b.toJSON()];
  }, undo:"destroyThread"};
  a.destroyThread = {type:106, do:function(b) {
    this.editor.board.findById(b[0].id).destroy(!0, !0);
  }, state:function(b) {
    return [this.editor.board.findById(b[0].id).thread.toJSON()];
  }, log:function(b) {
  }, undo:"addThread"};
  a.destroyBlock = {type:106, do:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    b.doDestroy(!0);
  }, state:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    return [b.toJSON(), b.pointer()];
  }, log:function(b) {
  }, undo:"recoverBlock"};
  a.recoverBlock = {type:106, do:function(b, a) {
    b = this.editor.board.code.createThread([b]).getFirstBlock();
    "string" === typeof b && (b = this.editor.board.findById(b));
    this.editor.board.insert(b, a);
  }, state:function(b) {
    "string" !== typeof b && (b = b.id);
    return [b];
  }, log:function(b) {
  }, undo:"destroyBlock"};
  a.insertBlock = {type:102, do:function(b, a, c) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    this.editor.board.insert(b, a, c);
  }, state:function(b, a) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    a = [b.id];
    var c = b.targetPointer();
    a.push(c);
    "string" !== typeof b && "basic" === b.getBlockType() && a.push(b.thread.getCount(b));
    return a;
  }, log:function(b) {
  }, undo:"insertBlock"};
  a.separateBlock = {type:103, do:function(b) {
    b.view && b.view._toGlobalCoordinate(Entry.DRAG_MODE_DRAG);
    b.doSeparate();
  }, state:function(b) {
    var a = [b.id], c = b.targetPointer();
    a.push(c);
    "basic" === b.getBlockType() && a.push(b.thread.getCount(b));
    return a;
  }, log:function(b) {
  }, undo:"insertBlock"};
  a.moveBlock = {type:104, do:function(b, a, c) {
    void 0 !== a ? (b = this.editor.board.findById(b), b.moveTo(a, c)) : b._updatePos();
  }, state:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    return [b.id, b.x, b.y];
  }, log:function(b) {
    return [b.id, b.toJSON()];
  }, undo:"moveBlock"};
  a.cloneBlock = {type:105, do:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    this.editor.board.code.createThread(b.copy());
  }, state:function(b) {
    "string" !== typeof b && (b = b.id);
    return [b];
  }, log:function(b) {
    return [b.id, b.toJSON()];
  }, undo:"uncloneBlock"};
  a.uncloneBlock = {type:105, do:function(b) {
    this.editor.board.code.getThreads().pop().getFirstBlock().destroy(!0, !0);
  }, state:function(b) {
    return [b];
  }, log:function(b) {
    return [b.id, b.toJSON()];
  }, undo:"cloneBlock"};
  a.scrollBoard = {type:105, do:function(b, a) {
    this.editor.board.scroller._scroll(b, a);
  }, state:function(b, a) {
    return [-b, -a];
  }, log:function(b) {
    return [b.id, b.toJSON()];
  }, undo:"scrollBoard"};
  a.setFieldValue = {type:106, do:function(b, a, c, e, f) {
    a.setValue(f, !0);
  }, state:function(b, a, c, e, f) {
    return [b, a, c, f, e];
  }, log:function(b, a) {
    return [b.id, a];
  }, undo:"setFieldValue"};
})(Entry.Command);
(function(a) {
  a.selectObject = {type:201, do:function(b) {
    return Entry.container.selectObject(b);
  }, state:function(b) {
    if ((b = Entry.playground) && b.object) {
      return [b.object.id];
    }
  }, log:function(b) {
    return [b];
  }, undo:"selectObject"};
})(Entry.Command);
Entry.Container = function() {
  this.objects_ = [];
  this.cachedPicture = {};
  this.inputValue = {};
  this.currentObjects_ = this.copiedObject = null;
};
Entry.Container.prototype.generateView = function(a, b) {
  this._view = a;
  this._view.addClass("entryContainer");
  b && "workspace" != b ? "phone" == b && (this._view.addClass("entryContainerPhone"), a = Entry.createElement("div"), a.addClass("entryAddObjectWorkspace"), a.innerHTML = Lang.Workspace.add_object, a.bindOnClick(function(b) {
    Entry.dispatchEvent("openSpriteManager");
  }), a = Entry.createElement("div"), a.addClass("entryContainerListPhoneWrapper"), this._view.appendChild(a), b = Entry.createElement("ul"), b.addClass("entryContainerListPhone"), a.appendChild(b), this.listView_ = b) : (this._view.addClass("entryContainerWorkspace"), this._view.setAttribute("id", "entryContainerWorkspaceId"), a = Entry.createElement("div"), a.addClass("entryAddObjectWorkspace"), a.innerHTML = Lang.Workspace.add_object, a.bindOnClick(function(b) {
    Entry.dispatchEvent("openSpriteManager");
  }), a = Entry.createElement("div"), a.addClass("entryContainerListWorkspaceWrapper"), Entry.isForLecture && (this.generateTabView(), a.addClass("lecture")), Entry.Utils.disableContextmenu(a), $(a).on("contextmenu", function(b) {
    Entry.ContextMenu.show([{text:Lang.Blocks.Paste_blocks, callback:function() {
      Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
    }}], "workspace-contextmenu");
  }), this._view.appendChild(a), b = Entry.createElement("ul"), b.addClass("entryContainerListWorkspace"), a.appendChild(b), this.listView_ = b, this.enableSort());
};
Entry.Container.prototype.enableSort = function() {
  $ && $(this.listView_).sortable({start:function(a, b) {
    b.item.data("start_pos", b.item.index());
  }, stop:function(a, b) {
    a = b.item.data("start_pos");
    b = b.item.index();
    Entry.container.moveElement(a, b);
  }, axis:"y"});
};
Entry.Container.prototype.disableSort = function() {
  $ && $(this.listView_).sortable("destroy");
};
Entry.Container.prototype.updateListView = function() {
  if (this.listView_) {
    for (var a = this.listView_;a.hasChildNodes();) {
      a.removeChild(a.lastChild);
    }
    var b = this.getCurrentObjects(), d;
    for (d in b) {
      a.appendChild(b[d].view_);
    }
    Entry.stage.sortZorder();
  }
};
Entry.Container.prototype.setObjects = function(a) {
  for (var b in a) {
    var d = new Entry.EntryObject(a[b]);
    this.objects_.push(d);
    d.generateView();
    d.pictures.map(function(b) {
      Entry.playground.generatePictureElement(b);
    });
    d.sounds.map(function(b) {
      Entry.playground.generateSoundElement(b);
    });
  }
  this.updateObjectsOrder();
  this.updateListView();
  Entry.stage.sortZorder();
  Entry.variableContainer.updateViews();
  a = Entry.type;
  ("workspace" == a || "phone" == a) && (a = this.getCurrentObjects()[0]) && this.selectObject(a.id);
};
Entry.Container.prototype.getPictureElement = function(a) {
  for (var b in this.objects_) {
    var d = this.objects_[b], c;
    for (c in d.pictures) {
      if (a === d.pictures[c].id) {
        return d.pictures[c].view;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.setPicture = function(a) {
  for (var b in this.objects_) {
    var d = this.objects_[b], c;
    for (c in d.pictures) {
      if (a.id === d.pictures[c].id) {
        b = {};
        b.dimension = a.dimension;
        b.id = a.id;
        b.filename = a.filename;
        b.fileurl = a.fileurl;
        b.name = a.name;
        b.view = d.pictures[c].view;
        d.pictures[c] = b;
        return;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.selectPicture = function(a) {
  for (var b in this.objects_) {
    var d = this.objects_[b], c;
    for (c in d.pictures) {
      var e = d.pictures[c];
      if (a === e.id) {
        return d.selectedPicture = e, d.entity.setImage(e), d.updateThumbnailView(), d.id;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.addObject = function(a, b) {
  var d = new Entry.EntryObject(a);
  d.name = Entry.getOrderedName(d.name, this.objects_);
  Entry.stateManager && Entry.stateManager.addCommand("add object", this, this.removeObject, d);
  d.scene || (d.scene = Entry.scene.selectedScene);
  "number" == typeof b ? a.sprite.category && "background" == a.sprite.category.main ? (d.setLock(!0), this.objects_.push(d)) : this.objects_.splice(b, 0, d) : a.sprite.category && "background" == a.sprite.category.main ? this.objects_.push(d) : this.objects_.unshift(d);
  d.generateView();
  d.pictures.map(function(b) {
    b.id = Entry.generateHash();
    Entry.playground.generatePictureElement(b);
  });
  d.sounds.map(function(b) {
    Entry.playground.generateSoundElement(b);
  });
  this.setCurrentObjects();
  this.updateObjectsOrder();
  this.updateListView();
  this.selectObject(d.id);
  Entry.variableContainer.updateViews();
  return new Entry.State(this, this.removeObject, d);
};
Entry.Container.prototype.addCloneObject = function(a, b) {
  a = a.toJSON();
  var d = Entry.generateHash();
  Entry.variableContainer.addCloneLocalVariables({objectId:a.id, newObjectId:d, json:a});
  a.id = d;
  a.scene = b || Entry.scene.selectedScene;
  this.addObject(a);
};
Entry.Container.prototype.removeObject = function(a) {
  var b = this.objects_.indexOf(a), d = a.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove object", this, this.addObject, d, b);
  d = new Entry.State(this.addObject, d, b);
  a.destroy();
  this.objects_.splice(b, 1);
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.objects_.length && 0 !== b ? 0 < this.getCurrentObjects().length ? Entry.container.selectObject(this.getCurrentObjects()[0].id) : Entry.container.selectObject() : this.objects_.length && 0 === b ? Entry.container.selectObject(this.getCurrentObjects()[0].id) : (Entry.container.selectObject(), Entry.playground.flushPlayground());
  Entry.toast.success(Lang.Workspace.remove_object, a.name + " " + Lang.Workspace.remove_object_msg);
  Entry.variableContainer.removeLocalVariables(a.id);
  Entry.playground.reloadPlayground();
  return d;
};
Entry.Container.prototype.selectObject = function(a, b) {
  a = this.getObject(a);
  b && a && Entry.scene.selectScene(a.scene);
  this.mapObjectOnScene(function(b) {
    b.view_ && b.view_.removeClass("selectedObject");
    b.isSelected_ = !1;
  });
  a && (a.view_ && a.view_.addClass("selectedObject"), a.isSelected_ = !0);
  Entry.playground && Entry.playground.injectObject(a);
  "minimize" != Entry.type && Entry.engine.isState("stop") && Entry.stage.selectObject(a);
};
Entry.Container.prototype.getAllObjects = function() {
  return this.objects_;
};
Entry.Container.prototype.getObject = function(a) {
  for (var b = this.objects_.length, d = 0;d < b;d++) {
    var c = this.objects_[d];
    if (c.id == a) {
      return c;
    }
  }
};
Entry.Container.prototype.getEntity = function(a) {
  if (a = this.getObject(a)) {
    return a.entity;
  }
  Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.object_not_found, !0);
};
Entry.Container.prototype.getVariable = function(a) {
  for (var b = 0;b < this.variables_.length;b++) {
    var d = this.variables_[b];
    if (d.getId() == a || d.getName() == a) {
      return d;
    }
  }
};
Entry.Container.prototype.moveElement = function(a, b, d) {
  var c;
  c = this.getCurrentObjects();
  a = this.getAllObjects().indexOf(c[a]);
  b = this.getAllObjects().indexOf(c[b]);
  !d && Entry.stateManager && Entry.stateManager.addCommand("reorder object", Entry.container, Entry.container.moveElement, b, a, !0);
  this.objects_.splice(b, 0, this.objects_.splice(a, 1)[0]);
  this.setCurrentObjects();
  Entry.container.updateListView();
  return new Entry.State(Entry.container, Entry.container.moveElement, b, a, !0);
};
Entry.Container.prototype.moveElementByBlock = function(a, b) {
  a = this.getCurrentObjects().splice(a, 1)[0];
  this.getCurrentObjects().splice(b, 0, a);
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getDropdownList = function(a) {
  var b = [];
  switch(a) {
    case "sprites":
      var d = this.getCurrentObjects(), c = d.length;
      for (a = 0;a < c;a++) {
        var e = d[a];
        b.push([e.name, e.id]);
      }
      break;
    case "spritesWithMouse":
      d = this.getCurrentObjects();
      c = d.length;
      for (a = 0;a < c;a++) {
        e = d[a], b.push([e.name, e.id]);
      }
      b.push([Lang.Blocks.mouse_pointer, "mouse"]);
      break;
    case "spritesWithSelf":
      d = this.getCurrentObjects();
      c = d.length;
      for (a = 0;a < c;a++) {
        e = d[a], b.push([e.name, e.id]);
      }
      b.push([Lang.Blocks.self, "self"]);
      break;
    case "collision":
      b.push([Lang.Blocks.mouse_pointer, "mouse"]);
      d = this.getCurrentObjects();
      c = d.length;
      for (a = 0;a < c;a++) {
        e = d[a], b.push([e.name, e.id]);
      }
      b.push([Lang.Blocks.wall, "wall"]);
      b.push([Lang.Blocks.wall_up, "wall_up"]);
      b.push([Lang.Blocks.wall_down, "wall_down"]);
      b.push([Lang.Blocks.wall_right, "wall_right"]);
      b.push([Lang.Blocks.wall_left, "wall_left"]);
      break;
    case "pictures":
      if (!Entry.playground.object) {
        break;
      }
      d = Entry.playground.object.pictures;
      for (a = 0;a < d.length;a++) {
        c = d[a], b.push([c.name, c.id]);
      }
      break;
    case "messages":
      d = Entry.variableContainer.messages_;
      for (a = 0;a < d.length;a++) {
        c = d[a], b.push([c.name, c.id]);
      }
      break;
    case "variables":
      d = Entry.variableContainer.variables_;
      for (a = 0;a < d.length;a++) {
        c = d[a], c.object_ && c.object_ != Entry.playground.object.id || b.push([c.getName(), c.getId()]);
      }
      b && 0 !== b.length || b.push([Lang.Blocks.VARIABLE_variable, "null"]);
      break;
    case "lists":
      d = Entry.variableContainer.lists_;
      for (a = 0;a < d.length;a++) {
        c = d[a], b.push([c.getName(), c.getId()]);
      }
      b && 0 !== b.length || b.push([Lang.Blocks.VARIABLE_list, "null"]);
      break;
    case "scenes":
      d = Entry.scene.scenes_;
      for (a = 0;a < d.length;a++) {
        c = d[a], b.push([c.name, c.id]);
      }
      break;
    case "sounds":
      if (!Entry.playground.object) {
        break;
      }
      d = Entry.playground.object.sounds;
      for (a = 0;a < d.length;a++) {
        c = d[a], b.push([c.name, c.id]);
      }
      break;
    case "clone":
      b.push([Lang.Blocks.oneself, "self"]);
      c = this.objects_.length;
      for (a = 0;a < c;a++) {
        e = this.objects_[a], b.push([e.name, e.id]);
      }
      break;
    case "objectSequence":
      for (c = this.getCurrentObjects().length, a = 0;a < c;a++) {
        b.push([(a + 1).toString(), a.toString()]);
      }
    ;
  }
  b.length || (b = [[Lang.Blocks.no_target, "null"]]);
  return b;
};
Entry.Container.prototype.clearRunningState = function() {
  this.mapObject(function(a) {
    a.clearExecutor();
    for (var b = a.clonedEntities.length;0 < b;b--) {
      a.clonedEntities[b - 1].removeClone();
    }
    a.clonedEntities = [];
  });
};
Entry.Container.prototype.mapObject = function(a, b) {
  for (var d = this.objects_.length, c = [], e = 0;e < d;e++) {
    c.push(a(this.objects_[e], b));
  }
  return c;
};
Entry.Container.prototype.mapObjectOnScene = function(a, b) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < c;f++) {
    e.push(a(d[f], b));
  }
  return e;
};
Entry.Container.prototype.clearRunningStateOnScene = function() {
  this.mapObjectOnScene(function(a) {
    a.clearExecutor();
    for (var b = a.clonedEntities.length;0 < b;b--) {
      a.clonedEntities[b - 1].removeClone();
    }
    a.clonedEntities = [];
  });
};
Entry.Container.prototype.mapEntity = function(a, b) {
  for (var d = this.objects_.length, c = [], e = 0;e < d;e++) {
    c.push(a(this.objects_[e].entity, b));
  }
  return c;
};
Entry.Container.prototype.mapEntityOnScene = function(a, b) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < c;f++) {
    e.push(a(d[f].entity, b));
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeClone = function(a, b) {
  for (var d = this.objects_, c = d.length, e = [], f = 0;f < c;f++) {
    var g = d[f], h = g.clonedEntities.length;
    e.push(a(g.entity, b));
    for (var k = 0;k < h;k++) {
      var l = g.clonedEntities[k];
      l && !l.isStamp && e.push(a(l, b));
    }
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeCloneOnScene = function(a, b) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < c;f++) {
    var g = d[f], h = g.clonedEntities.length;
    e.push(a(g.entity, b));
    for (var k = 0;k < h;k++) {
      var l = g.clonedEntities[k];
      l && !l.isStamp && e.push(a(l, b));
    }
  }
  return e;
};
Entry.Container.prototype.getCachedPicture = function(a) {
  Entry.assert("string" == typeof a, "pictureId must be string");
  return this.cachedPicture[a];
};
Entry.Container.prototype.cachePicture = function(a, b) {
  this.cachedPicture[a] = b;
};
Entry.Container.prototype.toJSON = function() {
  for (var a = [], b = this.objects_.length, d = 0;d < b;d++) {
    a.push(this.objects_[d].toJSON());
  }
  return a;
};
Entry.Container.prototype.takeSequenceSnapshot = function() {
  for (var a = this.objects_.length, b = this.objects_, d = 0;d < a;d++) {
    b[d].index = d;
  }
};
Entry.Container.prototype.loadSequenceSnapshot = function() {
  for (var a = this.objects_.length, b = Array(a), d = 0;d < a;d++) {
    var c = this.objects_[d];
    b[c.index] = c;
    delete c.index;
  }
  this.objects_ = b;
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getInputValue = function() {
  return this.inputValue.getValue();
};
Entry.Container.prototype.setInputValue = function(a) {
  a ? this.inputValue.setValue(a) : this.inputValue.setValue(0);
};
Entry.Container.prototype.resetSceneDuringRun = function() {
  this.mapEntityOnScene(function(a) {
    a.loadSnapshot();
    a.object.filters = [];
    a.resetFilter();
    a.dialog && a.dialog.remove();
    a.shape && a.removeBrush();
  });
  this.clearRunningStateOnScene();
};
Entry.Container.prototype.setCopiedObject = function(a) {
  this.copiedObject = a;
};
Entry.Container.prototype.updateObjectsOrder = function() {
  for (var a = Entry.scene.getScenes(), b = [], d = 0;d < a.length;d++) {
    for (var c = this.getSceneObjects(a[d]), e = 0;e < c.length;e++) {
      b.push(c[e]);
    }
  }
  this.objects_ = b;
};
Entry.Container.prototype.getSceneObjects = function(a) {
  a = a || Entry.scene.selectedScene;
  for (var b = [], d = this.getAllObjects(), c = 0;c < d.length;c++) {
    a.id == d[c].scene.id && b.push(d[c]);
  }
  return b;
};
Entry.Container.prototype.setCurrentObjects = function() {
  this.currentObjects_ = this.getSceneObjects();
};
Entry.Container.prototype.getCurrentObjects = function() {
  var a = this.currentObjects_;
  a && 0 !== a.length || this.setCurrentObjects();
  return this.currentObjects_;
};
Entry.Container.prototype.getProjectWithJSON = function(a) {
  a.objects = Entry.container.toJSON();
  a.variables = Entry.variableContainer.getVariableJSON();
  a.messages = Entry.variableContainer.getMessageJSON();
  a.scenes = Entry.scene.toJSON();
  return a;
};
Entry.Container.prototype.generateTabView = function() {
  var a = this._view, b = this;
  this.tabViews = [];
  var d = Entry.createElement("div");
  d.addClass("entryContainerTabViewWorkspace");
  a.appendChild(d);
  var c = Entry.createElement("span");
  c.addClass("entryContainerTabItemWorkspace");
  c.addClass("entryEllipsis");
  c.innerHTML = Lang.Menus.lecture_container_tab_object;
  c.bindOnClick(function() {
    b.changeTabView("object");
  });
  this.tabViews.push(c);
  d.appendChild(c);
  var e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace", "entryRemove");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_video;
  e.bindOnClick(function() {
    b.changeTabView("movie");
  });
  this.tabViews.push(e);
  d.appendChild(e);
  this.youtubeTab = e;
  e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace", "entryRemove");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_project;
  e.bindOnClick(function() {
    b.changeTabView("done");
  });
  this.tabViews.push(e);
  d.appendChild(e);
  this.iframeTab = e;
  e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_help;
  e.bindOnClick(function() {
    b.changeTabView("helper");
  });
  this.tabViews.push(e);
  d.appendChild(e);
  d = Entry.createElement("div");
  d.addClass("entryContainerMovieWorkspace");
  d.addClass("entryHide");
  a.appendChild(d);
  this.movieContainer = d;
  d = Entry.createElement("div");
  d.addClass("entryContainerDoneWorkspace");
  d.addClass("entryHide");
  a.appendChild(d);
  this.doneContainer = d;
  d = Entry.createElement("div");
  d.addClass("entryContainerHelperWorkspace");
  d.addClass("entryHide");
  a.appendChild(d);
  this.helperContainer = d;
  c.addClass("selected");
};
Entry.Container.prototype.changeTabView = function(a) {
  for (var b = this.tabViews, d = 0, c = b.length;d < c;d++) {
    b[d].removeClass("selected");
  }
  this.movieContainer.addClass("entryHide");
  this.doneContainer.addClass("entryHide");
  this.helperContainer.addClass("entryHide");
  "object" == a ? b[0].addClass("selected") : "movie" == a ? (a = this._view, a = a.style.width.substring(0, a.style.width.length - 2), this.movieFrame.setAttribute("width", a), this.movieFrame.setAttribute("height", 9 * a / 16), this.movieContainer.removeClass("entryHide"), b[1].addClass("selected")) : "done" == a ? (d = $(this.doneContainer).height(), a = $(this.doneContainer).width(), 9 * a / 16 + 35 < d ? d = 9 * a / 16 + 35 : a = (d - 35) / 9 * 16, this.doneProjectFrame.setAttribute("width", 
  a), this.doneProjectFrame.setAttribute("height", d), this.doneContainer.removeClass("entryHide"), b[2].addClass("selected")) : "helper" == a && (Entry.helper.blockHelperOn(), this.helperContainer.removeClass("entryHide"), b[3].addClass("selected"));
};
Entry.Container.prototype.initYoutube = function(a) {
  this.youtubeHash = a;
  this.youtubeTab.removeClass("entryRemove");
  a = this._view;
  a = a.style.width.substring(0, a.style.width.length - 2);
  var b = this.movieContainer, d = Entry.createElement("iframe");
  d.setAttribute("width", a);
  d.setAttribute("height", 9 * a / 16);
  d.setAttribute("allowfullscreen", "");
  d.setAttribute("frameborder", 0);
  d.setAttribute("src", "https://www.youtube.com/embed/" + this.youtubeHash);
  this.movieFrame = d;
  b.appendChild(d);
};
Entry.Container.prototype.initTvcast = function(a) {
  this.tvcast = a;
  this.youtubeTab.removeClass("entryRemove");
  a = this._view;
  a = a.style.width.substring(0, a.style.width.length - 2);
  var b = this.movieContainer, d = Entry.createElement("iframe");
  d.setAttribute("width", a);
  d.setAttribute("height", 9 * a / 16);
  d.setAttribute("allowfullscreen", "");
  d.setAttribute("frameborder", 0);
  d.setAttribute("src", this.tvcast);
  this.movieFrame = d;
  b.appendChild(d);
};
Entry.Container.prototype.initDoneProject = function(a) {
  this.doneProject = a;
  this.iframeTab.removeClass("entryRemove");
  a = this._view;
  a = a.style.width.substring(0, a.style.width.length - 2);
  var b = Entry.createElement("iframe");
  b.setAttribute("width", a);
  b.setAttribute("height", 9 * a / 16 + 35);
  b.setAttribute("frameborder", 0);
  b.setAttribute("src", "/api/iframe/project/" + this.doneProject);
  this.doneProjectFrame = b;
  this.doneContainer.appendChild(b);
};
Entry.Container.prototype.blurAllInputs = function() {
  this.getSceneObjects().map(function(a) {
    a = a.view_.getElementsByTagName("input");
    for (var b = 0, d = a.length;b < d;b++) {
      a[b].blur();
    }
  });
};
Entry.Container.prototype.showProjectAnswer = function() {
  var a = this.inputValue;
  a && a.setVisible(!0);
};
Entry.Container.prototype.hideProjectAnswer = function(a) {
  if ((a = this.inputValue) && a.isVisible() && !Entry.engine.isState("run")) {
    for (var b = Entry.container.getAllObjects(), d = ["ask_and_wait", "get_canvas_input_value", "set_visible_answer"], c = 0, e = b.length;c < e;c++) {
      for (var f = b[c].script, g = 0;g < d.length;g++) {
        if (f.hasBlockType(d[g])) {
          return;
        }
      }
    }
    a.setVisible(!1);
  }
};
Entry.Container.prototype.getView = function() {
  return this._view;
};
Entry.Container.prototype.resize = function() {
};
Entry.db = {data:{}, typeMap:{}};
(function(a) {
  a.add = function(b) {
    this.data[b.id] = b;
    var a = b.type;
    void 0 === this.typeMap[a] && (this.typeMap[a] = {});
    this.typeMap[a][b.id] = b;
  };
  a.has = function(b) {
    return this.data.hasOwnProperty(b);
  };
  a.remove = function(b) {
    this.has(b) && (delete this.typeMap[this.data[b].type][b], delete this.data[b]);
  };
  a.get = function(b) {
    return this.data[b];
  };
  a.find = function() {
  };
  a.clear = function() {
    this.data = {};
    this.typeMap = {};
  };
})(Entry.db);
Entry.Dom = function(a, b) {
  var d = /<(\w+)>/, c;
  c = a instanceof HTMLElement ? $(a) : a instanceof jQuery ? a : d.test(a) ? $(a) : $("<" + a + "></" + a + ">");
  if (void 0 === b) {
    return c;
  }
  b.id && c.attr("id", b.id);
  b.class && c.addClass(b.class);
  b.classes && b.classes.map(function(b) {
    c.addClass(b);
  });
  b.src && c.attr("src", b.src);
  b.parent && b.parent.append(c);
  c.bindOnClick = function() {
    var b, a, d = function(b) {
      b.stopImmediatePropagation();
      b.handled || (b.handled = !0, a.call(this, b));
    };
    1 < arguments.length ? (a = arguments[1] instanceof Function ? arguments[1] : function() {
    }, b = "string" === typeof arguments[0] ? arguments[0] : "") : a = arguments[0] instanceof Function ? arguments[0] : function() {
    };
    if (b) {
      $(this).on("click tab", b, d);
    } else {
      $(this).on("click tab", d);
    }
  };
  return c;
};
Entry.SVG = function(a) {
  a = document.getElementById(a);
  return Entry.SVG.createElement(a);
};
Entry.SVG.NS = "http://www.w3.org/2000/svg";
Entry.SVG.NS_XLINK = "http://www.w3.org/1999/xlink";
Entry.SVG.createElement = function(a, b) {
  a = "string" === typeof a ? document.createElementNS(Entry.SVG.NS, a) : a;
  if (b) {
    b.href && (a.setAttributeNS(Entry.SVG.NS_XLINK, "href", b.href), delete b.href);
    for (var d in b) {
      a.setAttribute(d, b[d]);
    }
  }
  this instanceof SVGElement && this.appendChild(a);
  a.elem = Entry.SVG.createElement;
  a.attr = Entry.SVG.attr;
  a.addClass = Entry.SVG.addClass;
  a.removeClass = Entry.SVG.removeClass;
  a.hasClass = Entry.SVG.hasClass;
  a.remove = Entry.SVG.remove;
  a.removeAttr = Entry.SVG.removeAttr;
  return a;
};
Entry.SVG.attr = function(a, b) {
  if ("string" === typeof a) {
    var d = {};
    d[a] = b;
    a = d;
  }
  if (a) {
    a.href && (this.setAttributeNS(Entry.SVG.NS_XLINK, "href", a.href), delete a.href);
    for (var c in a) {
      this.setAttribute(c, a[c]);
    }
  }
  return this;
};
Entry.SVG.addClass = function(a) {
  for (var b = this.getAttribute("class"), d = 0;d < arguments.length;d++) {
    a = arguments[d], this.hasClass(a) || (b += " " + a);
  }
  this.setAttribute("class", b);
  return this;
};
Entry.SVG.removeClass = function(a) {
  for (var b = this.getAttribute("class"), d = 0;d < arguments.length;d++) {
    a = arguments[d], this.hasClass(a) && (b = b.replace(new RegExp("(\\s|^)" + a + "(\\s|$)"), " "));
  }
  this.setAttribute("class", b);
  return this;
};
Entry.SVG.hasClass = function(a) {
  var b = this.getAttribute("class");
  return b ? b.match(new RegExp("(\\s|^)" + a + "(\\s|$)")) : !1;
};
Entry.SVG.remove = function() {
  this.parentNode && this.parentNode.removeChild(this);
};
Entry.SVG.removeAttr = function(a) {
  this.removeAttribute(a);
};
Entry.Dialog = function(a, b, d, c) {
  a.dialog && a.dialog.remove();
  a.dialog = this;
  this.parent = a;
  this.padding = 10;
  this.border = 2;
  "number" == typeof b && (b = String(b));
  this.message_ = b = b.match(/.{1,15}/g).join("\n");
  this.mode_ = d;
  "speak" == d && this.generateSpeak();
  c || Entry.stage.loadDialog(this);
};
Entry.Dialog.prototype.generateSpeak = function() {
  this.object = new createjs.Container;
  var a = new createjs.Text;
  a.font = "15px NanumGothic";
  a.textBaseline = "top";
  a.textAlign = "left";
  a.text = this.message_;
  var b = a.getTransformedBounds(), d = b.height, b = 10 <= b.width ? b.width : 17, c = new createjs.Shape;
  c.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").rr(-this.padding, -this.padding, b + 2 * this.padding, d + 2 * this.padding, this.padding);
  this.object.addChild(c);
  this.object.regX = b / 2;
  this.object.regY = d / 2;
  this.width = b;
  this.height = d;
  this.notch = this.createSpeakNotch("ne");
  this.update();
  this.object.addChild(this.notch);
  this.object.addChild(a);
};
Entry.Dialog.prototype.update = function() {
  var a = this.parent.object.getTransformedBounds(), b = "";
  -135 < a.y - this.height - 20 - this.border ? (this.object.y = a.y - this.height / 2 - 20 - this.padding, b += "n") : (this.object.y = a.y + a.height + this.height / 2 + 20 + this.padding, b += "s");
  240 > a.x + a.width + this.width ? (this.object.x = a.x + a.width + this.width / 2, b += "e") : (this.object.x = a.x - this.width / 2, b += "w");
  this.notch.type != b && (this.object.removeChild(this.notch), this.notch = this.createSpeakNotch(b), this.object.addChild(this.notch));
};
Entry.Dialog.prototype.createSpeakNotch = function(a) {
  var b = new createjs.Shape;
  b.type = a;
  "ne" == a ? b.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, this.height + this.padding - 1.5).lt(-10, this.height + this.padding + 20).lt(20, this.height + this.padding - 1.5) : "nw" == a ? b.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, this.height + this.padding - 1.5).lt(this.width + 10, this.height + this.padding + 20).lt(this.width - 20, this.height + this.padding - 1.5) : "se" == a ? b.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, -this.padding + 1.5).lt(-10, 
  -this.padding - 20).lt(20, -this.padding + 1.5) : "sw" == a && b.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, -this.padding + 1.5).lt(this.width + 10, -this.padding - 20).lt(this.width - 20, -this.padding + 1.5);
  return b;
};
Entry.Dialog.prototype.remove = function() {
  Entry.stage.unloadDialog(this);
  this.parent.dialog = null;
};
Entry.DoneProject = function(a) {
  this.generateView(a);
};
var p = Entry.DoneProject.prototype;
p.init = function(a) {
  this.projectId = a;
};
p.generateView = function(a) {
  var b = Entry.createElement("div");
  b.addClass("entryContainerDoneWorkspace");
  this.doneContainer = b;
  var d = Entry.createElement("iframe");
  d.setAttribute("id", "doneProjectframe");
  d.setAttribute("frameborder", 0);
  d.setAttribute("src", "/api/iframe/project/" + a);
  this.doneProjectFrame = d;
  this.doneContainer.appendChild(d);
  b.addClass("entryRemove");
};
p.getView = function() {
  return this.doneContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var a = document.getElementById("doneProjectframe"), b = this.doneContainer.offsetWidth;
  a.width = b + "px";
  a.height = 9 * b / 16 + "px";
};
Entry.Engine = function() {
  function a(b) {
    var a = [37, 38, 39, 40, 32], c = b.keyCode || b.which, e = Entry.stage.inputField;
    32 == c && e && e.hasFocus() || -1 < a.indexOf(c) && b.preventDefault();
  }
  this.state = "stop";
  this.popup = null;
  this.isUpdating = !0;
  this.speeds = [1, 15, 30, 45, 60];
  Entry.keyPressed && Entry.keyPressed.attach(this, this.captureKeyEvent);
  Entry.addEventListener("canvasClick", function(b) {
    Entry.engine.fireEvent("mouse_clicked");
  });
  Entry.addEventListener("canvasClickCanceled", function(b) {
    Entry.engine.fireEvent("mouse_click_cancled");
  });
  Entry.addEventListener("entityClick", function(b) {
    Entry.engine.fireEventOnEntity("when_object_click", b);
  });
  Entry.addEventListener("entityClickCanceled", function(b) {
    Entry.engine.fireEventOnEntity("when_object_click_canceled", b);
  });
  "phone" != Entry.type && (Entry.addEventListener("stageMouseMove", function(b) {
    Entry.engine.updateMouseView();
  }), Entry.addEventListener("stageMouseOut", function(b) {
    Entry.engine.hideMouseView();
  }));
  Entry.addEventListener("run", function() {
    $(window).bind("keydown", a);
  });
  Entry.addEventListener("stop", function() {
    $(window).unbind("keydown", a);
  });
};
Entry.Engine.prototype.generateView = function(a, b) {
  if (b && "workspace" != b) {
    "minimize" == b ? (this.view_ = a, this.view_.addClass("entryEngine"), this.view_.addClass("entryEngineMinimize"), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonMinimize"), this.maximizeButton.addClass("entryMaximizeButtonMinimize"), this.view_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(b) {
      Entry.engine.toggleFullscreen();
    }), this.coordinateButton = Entry.createElement("button"), this.coordinateButton.addClass("entryEngineButtonMinimize"), this.coordinateButton.addClass("entryCoordinateButtonMinimize"), this.view_.appendChild(this.coordinateButton), this.coordinateButton.bindOnClick(function(b) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      Entry.stage.toggleCoordinator();
    }), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonMinimize"), this.runButton.addClass("entryRunButtonMinimize"), this.runButton.innerHTML = Lang.Blocks.START, this.view_.appendChild(this.runButton), this.runButton.bindOnClick(function(b) {
      Entry.engine.toggleRun();
    }), this.runButton2 = Entry.createElement("button"), this.runButton2.addClass("entryEngineBigButtonMinimize_popup"), this.runButton2.addClass("entryEngineBigButtonMinimize_popup_run"), this.view_.appendChild(this.runButton2), this.runButton2.bindOnClick(function(b) {
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonMinimize"), this.stopButton.addClass("entryStopButtonMinimize"), this.stopButton.addClass("entryRemove"), this.stopButton.innerHTML = Lang.Workspace.stop, this.view_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(b) {
      this.blur();
      Entry.engine.toggleStop();
    }), this.pauseButton = Entry.createElement("button"), this.pauseButton.innerHTML = Lang.Workspace.pause, this.pauseButton.addClass("entryEngineButtonMinimize"), this.pauseButton.addClass("entryPauseButtonMinimize"), this.pauseButton.addClass("entryRemove"), this.view_.appendChild(this.pauseButton), this.pauseButton.bindOnClick(function(b) {
      this.blur();
      Entry.engine.togglePause();
    }), this.mouseView = Entry.createElement("div"), this.mouseView.addClass("entryMouseViewMinimize"), this.mouseView.addClass("entryRemove"), this.view_.appendChild(this.mouseView)) : "phone" == b && (this.view_ = a, this.view_.addClass("entryEngine", "entryEnginePhone"), this.headerView_ = Entry.createElement("div", "entryEngineHeader"), this.headerView_.addClass("entryEngineHeaderPhone"), this.view_.appendChild(this.headerView_), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonPhone", 
    "entryMaximizeButtonPhone"), this.headerView_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(b) {
      Entry.engine.footerView_.addClass("entryRemove");
      Entry.engine.headerView_.addClass("entryRemove");
      Entry.launchFullScreen(Entry.engine.view_);
    }), document.addEventListener("fullscreenchange", function(b) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("webkitfullscreenchange", function(b) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("mozfullscreenchange", function(b) {
      Entry.engine.exitFullScreen();
    }), this.footerView_ = Entry.createElement("div", "entryEngineFooter"), this.footerView_.addClass("entryEngineFooterPhone"), this.view_.appendChild(this.footerView_), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonPhone", "entryRunButtonPhone"), Entry.objectAddable && this.runButton.addClass("small"), this.runButton.innerHTML = Lang.Workspace.run, this.footerView_.appendChild(this.runButton), this.runButton.bindOnClick(function(b) {
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonPhone", "entryStopButtonPhone", "entryRemove"), Entry.objectAddable && this.stopButton.addClass("small"), this.stopButton.innerHTML = Lang.Workspace.stop, this.footerView_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(b) {
      Entry.engine.toggleStop();
    }));
  } else {
    this.view_ = a;
    this.view_.addClass("entryEngine_w");
    this.view_.addClass("entryEngineWorkspace_w");
    var d = Entry.createElement("button");
    this.speedButton = d;
    this.speedButton.addClass("entrySpeedButtonWorkspace", "entryEngineTopWorkspace", "entryEngineButtonWorkspace_w");
    this.view_.appendChild(this.speedButton);
    this.speedButton.bindOnClick(function(b) {
      Entry.engine.toggleSpeedPanel();
      d.blur();
    });
    this.maximizeButton = Entry.createElement("button");
    this.maximizeButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryMaximizeButtonWorkspace_w");
    this.view_.appendChild(this.maximizeButton);
    this.maximizeButton.bindOnClick(function(b) {
      Entry.engine.toggleFullscreen();
    });
    var c = Entry.createElement("button");
    this.coordinateButton = c;
    this.coordinateButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryCoordinateButtonWorkspace_w");
    this.view_.appendChild(this.coordinateButton);
    this.coordinateButton.bindOnClick(function(b) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      c.blur();
      Entry.stage.toggleCoordinator();
    });
    this.addButton = Entry.createElement("button");
    this.addButton.addClass("entryEngineButtonWorkspace_w");
    this.addButton.addClass("entryAddButtonWorkspace_w");
    this.addButton.innerHTML = Lang.Workspace.add_object;
    this.addButton.bindOnClick(function(b) {
      Entry.dispatchEvent("openSpriteManager");
    });
    this.view_.appendChild(this.addButton);
    this.runButton = Entry.createElement("button");
    this.runButton.addClass("entryEngineButtonWorkspace_w");
    this.runButton.addClass("entryRunButtonWorkspace_w");
    this.runButton.innerHTML = Lang.Workspace.run;
    this.view_.appendChild(this.runButton);
    this.runButton.bindOnClick(function(b) {
      Entry.engine.toggleRun();
    });
    this.runButton2 = Entry.createElement("button");
    this.runButton2.addClass("entryEngineButtonWorkspace_w");
    this.runButton2.addClass("entryRunButtonWorkspace_w2");
    this.view_.appendChild(this.runButton2);
    this.runButton2.bindOnClick(function(b) {
      Entry.engine.toggleRun();
    });
    this.stopButton = Entry.createElement("button");
    this.stopButton.addClass("entryEngineButtonWorkspace_w");
    this.stopButton.addClass("entryStopButtonWorkspace_w");
    this.stopButton.addClass("entryRemove");
    this.stopButton.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton);
    this.stopButton.bindOnClick(function(b) {
      Entry.engine.toggleStop();
    });
    this.stopButton2 = Entry.createElement("button");
    this.stopButton2.addClass("entryEngineButtonWorkspace_w");
    this.stopButton2.addClass("entryStopButtonWorkspace_w2");
    this.stopButton2.addClass("entryRemove");
    this.stopButton2.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton2);
    this.stopButton2.bindOnClick(function(b) {
      Entry.engine.toggleStop();
    });
    this.pauseButton = Entry.createElement("button");
    this.pauseButton.addClass("entryEngineButtonWorkspace_w");
    this.pauseButton.addClass("entryPauseButtonWorkspace_w");
    this.pauseButton.addClass("entryRemove");
    this.view_.appendChild(this.pauseButton);
    this.pauseButton.bindOnClick(function(b) {
      Entry.engine.togglePause();
    });
    this.mouseView = Entry.createElement("div");
    this.mouseView.addClass("entryMouseViewWorkspace_w");
    this.mouseView.addClass("entryRemove");
    this.view_.appendChild(this.mouseView);
  }
};
Entry.Engine.prototype.toggleSpeedPanel = function() {
  if (this.speedPanelOn) {
    this.speedPanelOn = !1, $(Entry.stage.canvas.canvas).animate({top:"24px"}), this.coordinateButton.removeClass("entryRemove"), this.maximizeButton.removeClass("entryRemove"), this.mouseView.removeClass("entryRemoveElement"), $(this.speedLabel_).remove(), delete this.speedLabel_, $(this.speedProgress_).fadeOut(null, function(b) {
      $(this).remove();
      delete this.speedProgress_;
    }), $(this.speedHandle_).remove(), delete this.speedHandle_;
  } else {
    this.speedPanelOn = !0;
    $(Entry.stage.canvas.canvas).animate({top:"41px"});
    this.coordinateButton.addClass("entryRemove");
    this.maximizeButton.addClass("entryRemove");
    this.mouseView.addClass("entryRemoveElement");
    this.speedLabel_ = Entry.createElement("div", "entrySpeedLabelWorkspace");
    this.speedLabel_.innerHTML = Lang.Workspace.speed;
    this.view_.insertBefore(this.speedLabel_, this.maximizeButton);
    this.speedProgress_ = Entry.createElement("table", "entrySpeedProgressWorkspace");
    for (var a = Entry.createElement("tr"), b = this.speeds, d = 0;5 > d;d++) {
      (function(d) {
        var e = Entry.createElement("td", "progressCell" + d);
        e.bindOnClick(function() {
          Entry.engine.setSpeedMeter(b[d]);
        });
        a.appendChild(e);
      })(d);
    }
    this.view_.insertBefore(this.speedProgress_, this.maximizeButton);
    this.speedProgress_.appendChild(a);
    this.speedHandle_ = Entry.createElement("div", "entrySpeedHandleWorkspace");
    d = (Entry.interfaceState.canvasWidth - 84) / 5;
    $(this.speedHandle_).draggable({axis:"x", grid:[d, d], containment:[80, 0, 4 * d + 80, 0], drag:function(b, a) {
      b = (a.position.left - 80) / (Entry.interfaceState.canvasWidth - 84) * 5;
      b = Math.floor(b);
      0 > b || Entry.engine.setSpeedMeter(Entry.engine.speeds[b]);
    }});
    this.view_.insertBefore(this.speedHandle_, this.maximizeButton);
    this.setSpeedMeter(Entry.FPS);
  }
};
Entry.Engine.prototype.setSpeedMeter = function(a) {
  var b = this.speeds.indexOf(a);
  0 > b || (b = Math.min(4, b), b = Math.max(0, b), this.speedPanelOn && (this.speedHandle_.style.left = (Entry.interfaceState.canvasWidth - 80) / 10 * (2 * b + 1) + 80 - 9 + "px"), Entry.FPS != a && (clearInterval(this.ticker), this.ticker = setInterval(this.update, Math.floor(1E3 / a)), Entry.FPS = a));
};
Entry.Engine.prototype.start = function(a) {
  createjs.Ticker.setFPS(Entry.FPS);
  this.ticker = setInterval(this.update, Math.floor(1E3 / Entry.FPS));
};
Entry.Engine.prototype.stop = function() {
  clearInterval(this.ticker);
  this.ticker = null;
};
Entry.Engine.prototype.update = function() {
  Entry.engine.isState("run") && (Entry.engine.computeObjects(), Entry.hw.update());
};
Entry.Engine.prototype.computeObjects = function() {
  Entry.container.mapObjectOnScene(this.computeFunction);
};
Entry.Engine.prototype.computeFunction = function(a) {
  a.script.tick();
};
Entry.Engine.computeThread = function(a, b) {
  Entry.engine.isContinue = !0;
  for (a = !1;b && Entry.engine.isContinue && !a;) {
    Entry.engine.isContinue = !b.isRepeat;
    var d = b.run();
    a = d && d === b;
    b = d;
  }
  return b;
};
Entry.Engine.prototype.isState = function(a) {
  return -1 < this.state.indexOf(a);
};
Entry.Engine.prototype.run = function() {
  this.isState("run") ? this.toggleStop() : (this.isState("stop") || this.isState("pause")) && this.toggleRun();
};
Entry.Engine.prototype.toggleRun = function() {
  var a = Entry.playground.mainWorkspace, b = a.mode;
  b == Entry.Workspace.MODE_VIMBOARD && a.loadCodeFromText(b);
  Entry.addActivity("run");
  "stop" == this.state && (Entry.container.mapEntity(function(b) {
    b.takeSnapshot();
  }), Entry.variableContainer.mapVariable(function(b) {
    b.takeSnapshot();
  }), Entry.variableContainer.mapList(function(b) {
    b.takeSnapshot();
  }), Entry.container.takeSequenceSnapshot(), Entry.scene.takeStartSceneSnapshot(), this.state = "run", this.fireEvent("start"));
  this.state = "run";
  "mobile" == Entry.type && this.view_.addClass("entryEngineBlueWorkspace");
  this.pauseButton.innerHTML = Lang.Workspace.pause;
  this.runButton.addClass("run");
  this.runButton.addClass("entryRemove");
  this.stopButton.removeClass("entryRemove");
  this.pauseButton && this.pauseButton.removeClass("entryRemove");
  this.runButton2 && this.runButton2.addClass("entryRemove");
  this.stopButton2 && this.stopButton2.removeClass("entryRemove");
  this.isUpdating || (Entry.engine.update(), Entry.engine.isUpdating = !0);
  Entry.stage.selectObject();
  Entry.dispatchEvent("run");
};
Entry.Engine.prototype.toggleStop = function() {
  Entry.addActivity("stop");
  var a = Entry.container, b = Entry.variableContainer;
  a.mapEntity(function(b) {
    b.loadSnapshot();
    b.object.filters = [];
    b.resetFilter();
    b.dialog && b.dialog.remove();
    b.brush && b.removeBrush();
  });
  b.mapVariable(function(b) {
    b.loadSnapshot();
  });
  b.mapList(function(b) {
    b.loadSnapshot();
    b.updateView();
  });
  this.stopProjectTimer();
  a.clearRunningState();
  a.loadSequenceSnapshot();
  a.setInputValue();
  Entry.scene.loadStartSceneSnapshot();
  Entry.Func.clearThreads();
  createjs.Sound.setVolume(1);
  createjs.Sound.stop();
  this.view_.removeClass("entryEngineBlueWorkspace");
  this.runButton.removeClass("entryRemove");
  this.stopButton.addClass("entryRemove");
  this.pauseButton && this.pauseButton.addClass("entryRemove");
  this.runButton2 && this.runButton2.removeClass("entryRemove");
  this.stopButton2 && this.stopButton2.addClass("entryRemove");
  this.state = "stop";
  Entry.dispatchEvent("stop");
  Entry.stage.hideInputField();
};
Entry.Engine.prototype.togglePause = function() {
  "pause" == this.state ? (this.state = "run", this.pauseButton.innerHTML = Lang.Workspace.pause) : (this.state = "pause", this.pauseButton.innerHTML = Lang.Workspace.restart, this.runButton.removeClass("entryRemove"), this.stopButton.removeClass("entryRemove"));
};
Entry.Engine.prototype.fireEvent = function(a) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEvent, a);
};
Entry.Engine.prototype.raiseEvent = function(a, b) {
  a.parent.script.raiseEvent(b, a);
};
Entry.Engine.prototype.fireEventOnEntity = function(a, b) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEventOnEntity, [b, a]);
};
Entry.Engine.prototype.raiseEventOnEntity = function(a, b) {
  a === b[0] && a.parent.script.raiseEvent(b[1], a);
};
Entry.Engine.prototype.captureKeyEvent = function(a) {
  var b = a.keyCode, d = Entry.type;
  a.ctrlKey && "workspace" == d ? 83 == b ? (a.preventDefault(), Entry.dispatchEvent("saveWorkspace")) : 82 == b ? (a.preventDefault(), Entry.engine.run()) : 90 == b && (a.preventDefault(), console.log("engine"), Entry.dispatchEvent(a.shiftKey ? "redo" : "undo")) : Entry.engine.isState("run") && Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["keyPress", b]);
  Entry.engine.isState("stop") && "workspace" === d && 37 <= b && 40 >= b && Entry.stage.moveSprite(a);
};
Entry.Engine.prototype.raiseKeyEvent = function(a, b) {
  return a.parent.script.raiseEvent(b[0], a, String(b[1]));
};
Entry.Engine.prototype.updateMouseView = function() {
  var a = Entry.stage.mouseCoordinate;
  this.mouseView.innerHTML = "X : " + a.x + ", Y : " + a.y;
  this.mouseView.removeClass("entryRemove");
};
Entry.Engine.prototype.hideMouseView = function() {
  this.mouseView.addClass("entryRemove");
};
Entry.Engine.prototype.toggleFullscreen = function() {
  if (this.popup) {
    this.popup.remove(), this.popup = null;
  } else {
    this.popup = new Entry.Popup;
    if ("workspace" != Entry.type) {
      var a = $(document);
      $(this.popup.body_).css("top", a.scrollTop());
      $("body").css("overflow", "hidden");
      popup.window_.appendChild(Entry.stage.canvas.canvas);
    }
    popup.window_.appendChild(Entry.engine.view_);
  }
};
Entry.Engine.prototype.exitFullScreen = function() {
  document.webkitIsFullScreen || document.mozIsFullScreen || document.isFullScreen || (Entry.engine.footerView_.removeClass("entryRemove"), Entry.engine.headerView_.removeClass("entryRemove"));
};
Entry.Engine.prototype.showProjectTimer = function() {
  Entry.engine.projectTimer && this.projectTimer.setVisible(!0);
};
Entry.Engine.prototype.hideProjectTimer = function() {
  var a = this.projectTimer;
  if (a && a.isVisible() && !this.isState("run")) {
    for (var b = Entry.container.getAllObjects(), d = ["get_project_timer_value", "reset_project_timer", "set_visible_project_timer", "choose_project_timer_action"], c = 0, e = b.length;c < e;c++) {
      for (var f = b[c].script, g = 0;g < d.length;g++) {
        if (f.hasBlockType(d[g])) {
          return;
        }
      }
    }
    a.setVisible(!1);
  }
};
Entry.Engine.prototype.clearTimer = function() {
  clearInterval(this.ticker);
  clearInterval(this.projectTimer.tick);
};
Entry.Engine.prototype.startProjectTimer = function() {
  var a = this.projectTimer;
  a && (a.start = (new Date).getTime(), a.isInit = !0, a.pausedTime = 0, a.tick = setInterval(function(b) {
    Entry.engine.updateProjectTimer();
  }, 1E3 / 60));
};
Entry.Engine.prototype.stopProjectTimer = function() {
  var a = this.projectTimer;
  a && (this.updateProjectTimer(0), a.isPaused = !1, a.isInit = !1, a.pausedTime = 0, clearInterval(a.tick));
};
Entry.Engine.prototype.updateProjectTimer = function(a) {
  var b = Entry.engine.projectTimer, d = (new Date).getTime();
  b && ("undefined" == typeof a ? b.isPaused || b.setValue((d - b.start - b.pausedTime) / 1E3) : (b.setValue(a), b.pausedTime = 0, b.start = d));
};
Entry.EntityObject = function(a) {
  this.parent = a;
  this.type = a.objectType;
  this.flip = !1;
  this.collision = Entry.Utils.COLLISION.NONE;
  this.id = Entry.generateHash();
  "sprite" == this.type ? (this.object = new createjs.Bitmap, this.effect = {}, this.setInitialEffectValue()) : "textBox" == this.type && (this.object = new createjs.Container, this.textObject = new createjs.Text, this.textObject.font = "20px Nanum Gothic", this.textObject.textBaseline = "middle", this.textObject.textAlign = "center", this.bgObject = new createjs.Shape, this.bgObject.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect(0, 0, 100, 100), this.object.addChild(this.bgObject), this.object.addChild(this.textObject), 
  this.fontType = "Nanum Gothic", this.fontSize = 20, this.strike = this.underLine = this.fontItalic = this.fontBold = !1);
  this.object.entity = this;
  this.object.cursor = "pointer";
  this.object.on("mousedown", function(b) {
    var a = this.entity.parent.id;
    Entry.dispatchEvent("entityClick", this.entity);
    Entry.stage.isObjectClick = !0;
    "minimize" != Entry.type && Entry.engine.isState("stop") && (this.offset = {x:-this.parent.x + this.entity.getX() - (.75 * b.stageX - 240), y:-this.parent.y - this.entity.getY() - (.75 * b.stageY - 135)}, this.cursor = "move", this.entity.initCommand(), Entry.container.selectObject(a));
  });
  this.object.on("pressup", function(b) {
    Entry.dispatchEvent("entityClickCanceled", this.entity);
    this.cursor = "pointer";
    this.entity.checkCommand();
  });
  this.object.on("pressmove", function(b) {
    "minimize" != Entry.type && Entry.engine.isState("stop") && !this.entity.parent.getLock() && (this.entity.doCommand(), this.entity.setX(.75 * b.stageX - 240 + this.offset.x), this.entity.setY(-(.75 * b.stageY - 135) - this.offset.y), Entry.stage.updateObject());
  });
};
Entry.EntityObject.prototype.injectModel = function(a, b) {
  "sprite" == this.type ? this.setImage(a) : "textBox" == this.type && (a = this.parent, b.text = b.text || a.text || a.name, this.setFont(b.font), this.setBGColour(b.bgColor), this.setColour(b.colour), this.setUnderLine(b.underLine), this.setStrike(b.strike), this.setText(b.text));
  b && this.syncModel_(b);
};
Entry.EntityObject.prototype.syncModel_ = function(a) {
  this.setX(a.x);
  this.setY(a.y);
  this.setRegX(a.regX);
  this.setRegY(a.regY);
  this.setScaleX(a.scaleX);
  this.setScaleY(a.scaleY);
  this.setRotation(a.rotation);
  this.setDirection(a.direction, !0);
  this.setLineBreak(a.lineBreak);
  this.setWidth(a.width);
  this.setHeight(a.height);
  this.setText(a.text);
  this.setTextAlign(a.textAlign);
  this.setFontSize(a.fontSize || this.getFontSize());
  this.setVisible(a.visible);
};
Entry.EntityObject.prototype.initCommand = function() {
  Entry.engine.isState("stop") && (this.isCommandValid = !1, Entry.stateManager && Entry.stateManager.addCommand("edit entity", this, this.restoreEntity, this.toJSON()));
};
Entry.EntityObject.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.EntityObject.prototype.checkCommand = function() {
  Entry.engine.isState("stop") && !this.isCommandValid && Entry.dispatchEvent("cancelLastCommand");
};
Entry.EntityObject.prototype.restoreEntity = function(a) {
  var b = this.toJSON();
  this.syncModel_(a);
  Entry.dispatchEvent("updateObject");
  Entry.stateManager && Entry.stateManager.addCommand("restore object", this, this.restoreEntity, b);
};
Entry.EntityObject.prototype.setX = function(a) {
  "number" == typeof a && (this.x = a, this.object.x = this.x, this.isClone || this.parent.updateCoordinateView(), this.updateDialog());
};
Entry.EntityObject.prototype.getX = function() {
  return this.x;
};
Entry.EntityObject.prototype.setY = function(a) {
  "number" == typeof a && (this.y = a, this.object.y = -this.y, this.isClone || this.parent.updateCoordinateView(), this.updateDialog());
};
Entry.EntityObject.prototype.getY = function() {
  return this.y;
};
Entry.EntityObject.prototype.getDirection = function() {
  return this.direction;
};
Entry.EntityObject.prototype.setDirection = function(a, b) {
  a || (a = 0);
  "vertical" != this.parent.getRotateMethod() || b || (0 <= this.direction && 180 > this.direction) == (0 <= a && 180 > a) || (this.setScaleX(-this.getScaleX()), Entry.stage.updateObject(), this.flip = !this.flip);
  this.direction = a.mod(360);
  this.object.direction = this.direction;
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.setRotation = function(a) {
  "free" != this.parent.getRotateMethod() && (a = 0);
  this.rotation = a.mod(360);
  this.object.rotation = this.rotation;
  this.updateDialog();
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.getRotation = function() {
  return this.rotation;
};
Entry.EntityObject.prototype.setRegX = function(a) {
  "textBox" == this.type && (a = 0);
  this.regX = a;
  this.object.regX = this.regX;
};
Entry.EntityObject.prototype.getRegX = function() {
  return this.regX;
};
Entry.EntityObject.prototype.setRegY = function(a) {
  "textBox" == this.type && (a = 0);
  this.regY = a;
  this.object.regY = this.regY;
};
Entry.EntityObject.prototype.getRegY = function() {
  return this.regY;
};
Entry.EntityObject.prototype.setScaleX = function(a) {
  this.scaleX = a;
  this.object.scaleX = this.scaleX;
  this.parent.updateCoordinateView();
  this.updateDialog();
};
Entry.EntityObject.prototype.getScaleX = function() {
  return this.scaleX;
};
Entry.EntityObject.prototype.setScaleY = function(a) {
  this.scaleY = a;
  this.object.scaleY = this.scaleY;
  this.parent.updateCoordinateView();
  this.updateDialog();
};
Entry.EntityObject.prototype.getScaleY = function() {
  return this.scaleY;
};
Entry.EntityObject.prototype.setSize = function(a) {
  1 > a && (a = 1);
  a /= this.getSize();
  this.setScaleX(this.getScaleX() * a);
  this.setScaleY(this.getScaleY() * a);
  this.isClone || this.parent.updateCoordinateView();
};
Entry.EntityObject.prototype.getSize = function() {
  return (this.getWidth() * Math.abs(this.getScaleX()) + this.getHeight() * Math.abs(this.getScaleY())) / 2;
};
Entry.EntityObject.prototype.setWidth = function(a) {
  this.width = a;
  this.object.width = this.width;
  this.textObject && this.getLineBreak() && (this.textObject.lineWidth = this.width);
  this.updateDialog();
  this.updateBG();
};
Entry.EntityObject.prototype.getWidth = function() {
  return this.width;
};
Entry.EntityObject.prototype.setHeight = function(a) {
  this.height = a;
  this.textObject && (this.object.height = this.height, this.alignTextBox());
  this.updateDialog();
  this.updateBG();
};
Entry.EntityObject.prototype.getHeight = function() {
  return this.height;
};
Entry.EntityObject.prototype.setColour = function(a) {
  a || (a = "#000000");
  this.colour = a;
  this.textObject && (this.textObject.color = this.colour);
};
Entry.EntityObject.prototype.getColour = function() {
  return this.colour;
};
Entry.EntityObject.prototype.setBGColour = function(a) {
  a || (a = "transparent");
  this.bgColor = a;
  this.updateBG();
};
Entry.EntityObject.prototype.getBGColour = function() {
  return this.bgColor;
};
Entry.EntityObject.prototype.setUnderLine = function(a) {
  void 0 === a && (a = !1);
  this.underLine = a;
  this.textObject.underLine = a;
};
Entry.EntityObject.prototype.getUnderLine = function() {
  return this.underLine;
};
Entry.EntityObject.prototype.setStrike = function(a) {
  void 0 === a && (a = !1);
  this.strike = a;
  this.textObject.strike = a;
};
Entry.EntityObject.prototype.getStrike = function() {
  return this.strike;
};
Entry.EntityObject.prototype.getFont = function() {
  var a = [];
  this.fontBold && a.push("bold");
  this.fontItalic && a.push("italic");
  a.push(this.getFontSize() + "px");
  a.push(this.fontType);
  return a.join(" ");
};
Entry.EntityObject.prototype.setFont = function(a) {
  if ("textBox" == this.parent.objectType && this.font !== a) {
    a || (a = "20px Nanum Gothic");
    var b = a.split(" "), d;
    if (d = -1 < b.indexOf("bold")) {
      b.splice(d - 1, 1), this.setFontBold(!0);
    }
    if (d = -1 < b.indexOf("italic")) {
      b.splice(d - 1, 1), this.setFontItalic(!0);
    }
    d = parseInt(b.shift());
    this.setFontSize(d);
    this.setFontType(b.join(" "));
    this.font = this.getFont();
    this.textObject.font = a;
    Entry.stage.update();
    this.setWidth(this.textObject.getMeasuredWidth());
    this.updateBG();
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.syncFont = function() {
  this.textObject.font = this.getFont();
  Entry.stage.update();
  this.getLineBreak() || this.setWidth(this.textObject.getMeasuredWidth());
  Entry.stage.updateObject();
};
Entry.EntityObject.prototype.getFontType = function() {
  return this.fontType;
};
Entry.EntityObject.prototype.setFontType = function(a) {
  "textBox" == this.parent.objectType && (this.fontType = a ? a : "Nanum Gothic", this.syncFont());
};
Entry.EntityObject.prototype.getFontSize = function(a) {
  return this.fontSize;
};
Entry.EntityObject.prototype.setFontSize = function(a) {
  "textBox" == this.parent.objectType && this.fontSize != a && (this.fontSize = a ? a : 20, this.syncFont(), this.alignTextBox());
};
Entry.EntityObject.prototype.setFontBold = function(a) {
  this.fontBold = a;
};
Entry.EntityObject.prototype.toggleFontBold = function() {
  this.fontBold = !this.fontBold;
  this.syncFont();
  return this.fontBold;
};
Entry.EntityObject.prototype.setFontItalic = function(a) {
  this.fontItalic = a;
};
Entry.EntityObject.prototype.toggleFontItalic = function() {
  this.fontItalic = !this.fontItalic;
  this.syncFont();
  return this.fontItalic;
};
Entry.EntityObject.prototype.setFontName = function(a) {
  for (var b = this.font.split(" "), d = [], c = 0, e = b.length;c < e;c++) {
    ("bold" === b[c] || "italic" === b[c] || -1 < b[c].indexOf("px")) && d.push(b[c]);
  }
  this.setFont(d.join(" ") + " " + a);
};
Entry.EntityObject.prototype.getFontName = function() {
  if ("textBox" == this.type) {
    if (!this.font) {
      return "";
    }
    for (var a = this.font.split(" "), b = [], d = 0, c = a.length;d < c;d++) {
      "bold" !== a[d] && "italic" !== a[d] && -1 === a[d].indexOf("px") && b.push(a[d]);
    }
    return b.join(" ").trim();
  }
};
Entry.EntityObject.prototype.setText = function(a) {
  "textBox" == this.parent.objectType && (void 0 === a && (a = ""), this.text = a, this.textObject.text = this.text, this.lineBreak || (this.setWidth(this.textObject.getMeasuredWidth()), this.parent.updateCoordinateView()), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getText = function() {
  return this.text;
};
Entry.EntityObject.prototype.setTextAlign = function(a) {
  "textBox" == this.parent.objectType && (void 0 === a && (a = Entry.TEXT_ALIGN_CENTER), this.textAlign = a, this.textObject.textAlign = Entry.TEXT_ALIGNS[this.textAlign], this.alignTextBox(), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getTextAlign = function() {
  return this.textAlign;
};
Entry.EntityObject.prototype.setLineBreak = function(a) {
  if ("textBox" == this.parent.objectType) {
    void 0 === a && (a = !1);
    var b = this.lineBreak;
    this.lineBreak = a;
    b && !this.lineBreak ? (this.textObject.lineWidth = null, this.setHeight(this.textObject.getMeasuredLineHeight()), this.setText(this.getText().replace(/\n/g, ""))) : !b && this.lineBreak && (this.setFontSize(this.getFontSize() * this.getScaleX()), this.setHeight(3 * this.textObject.getMeasuredLineHeight()), this.setWidth(this.getWidth() * this.getScaleX()), this.setScaleX(1), this.setScaleY(1), this.textObject.lineWidth = this.getWidth(), this.alignTextBox());
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.getLineBreak = function() {
  return this.lineBreak;
};
Entry.EntityObject.prototype.setVisible = function(a) {
  void 0 === a && (a = !0);
  this.visible = a;
  this.object.visible = this.visible;
  this.dialog && this.syncDialogVisible();
  return this.visible;
};
Entry.EntityObject.prototype.getVisible = function() {
  return this.visible;
};
Entry.EntityObject.prototype.setImage = function(a) {
  delete a._id;
  Entry.assert("sprite" == this.type, "Set image is only for sprite object");
  a.id || (a.id = Entry.generateHash());
  this.picture = a;
  var b = this.picture.dimension, d = this.getRegX() - this.getWidth() / 2, c = this.getRegY() - this.getHeight() / 2;
  this.setWidth(b.width);
  this.setHeight(b.height);
  b.scaleX || (b.scaleX = this.getScaleX(), b.scaleY = this.getScaleY());
  this.setScaleX(this.scaleX);
  this.setScaleY(this.scaleY);
  this.setRegX(this.width / 2 + d);
  this.setRegY(this.height / 2 + c);
  var e = Entry.container.getCachedPicture(a.id);
  if (e) {
    Entry.image = e, this.object.image = e, this.object.cache(0, 0, this.getWidth(), this.getHeight());
  } else {
    e = new Image;
    a.fileurl ? e.src = a.fileurl : (b = a.filename, e.src = Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/image/" + b + ".png");
    var f = this;
    e.onload = function(b) {
      Entry.container.cachePicture(a.id, e);
      Entry.image = e;
      f.object.image = e;
      f.object.cache(0, 0, f.getWidth(), f.getHeight());
      f = null;
    };
  }
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.applyFilter = function() {
  var a = this.object, b = this.effect, d = [], c = Entry.adjustValueWithMaxMin;
  b.brightness = b.brightness;
  var e = new createjs.ColorMatrix;
  e.adjustColor(c(b.brightness, -100, 100), 0, 0, 0);
  e = new createjs.ColorMatrixFilter(e);
  d.push(e);
  b.hue = b.hue.mod(360);
  e = new createjs.ColorMatrix;
  e.adjustColor(0, 0, 0, b.hue);
  e = new createjs.ColorMatrixFilter(e);
  d.push(e);
  var e = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], f = 10.8 * b.hsv * Math.PI / 180, g = Math.cos(f), f = Math.sin(f), h = Math.abs(b.hsv / 100);
  1 < h && (h -= Math.floor(h));
  0 < h && .33 >= h ? e = [1, 0, 0, 0, 0, 0, g, f, 0, 0, 0, -1 * f, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .66 >= h ? e = [g, 0, f, 0, 0, 0, 1, 0, 0, 0, f, 0, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .99 >= h && (e = [g, f, 0, 0, 0, -1 * f, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
  e = (new createjs.ColorMatrix).concat(e);
  e = new createjs.ColorMatrixFilter(e);
  d.push(e);
  a.alpha = b.alpha = c(b.alpha, 0, 1);
  a.filters = d;
  a.cache(0, 0, this.getWidth(), this.getHeight());
};
Entry.EntityObject.prototype.resetFilter = function() {
  "sprite" == this.parent.objectType && (this.object.filters = [], this.setInitialEffectValue(), this.object.alpha = this.effect.alpha, this.object.cache(0, 0, this.getWidth(), this.getHeight()));
};
Entry.EntityObject.prototype.updateDialog = function() {
  this.dialog && this.dialog.update();
};
Entry.EntityObject.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
  this.collision = Entry.Utils.COLLISION.NONE;
};
Entry.EntityObject.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  "sprite" == this.parent.objectType && this.setImage(this.parent.getPicture());
};
Entry.EntityObject.prototype.removeClone = function() {
  if (this.isClone) {
    this.dialog && this.dialog.remove();
    this.brush && this.removeBrush();
    Entry.stage.unloadEntity(this);
    var a = this.parent.clonedEntities.indexOf(this);
    this.parent.clonedEntities.splice(a, 1);
    Entry.Utils.isFunction(this.clearExecutor) && this.clearExecutor();
  }
};
Entry.EntityObject.prototype.clearExecutor = function() {
  this.parent.script.clearExecutorsByEntity(this);
};
Entry.EntityObject.prototype.toJSON = function() {
  var a = {};
  a.x = Entry.cutDecimal(this.getX());
  a.y = Entry.cutDecimal(this.getY());
  a.regX = Entry.cutDecimal(this.getRegX());
  a.regY = Entry.cutDecimal(this.getRegY());
  a.scaleX = this.getScaleX();
  a.scaleY = this.getScaleY();
  a.rotation = Entry.cutDecimal(this.getRotation());
  a.direction = Entry.cutDecimal(this.getDirection());
  a.width = Entry.cutDecimal(this.getWidth());
  a.height = Entry.cutDecimal(this.getHeight());
  a.font = this.getFont();
  a.visible = this.getVisible();
  "textBox" == this.parent.objectType && (a.colour = this.getColour(), a.text = this.getText(), a.textAlign = this.getTextAlign(), a.lineBreak = this.getLineBreak(), a.bgColor = this.getBGColour(), a.underLine = this.getUnderLine(), a.strike = this.getStrike(), a.fontSize = this.getFontSize());
  return a;
};
Entry.EntityObject.prototype.setInitialEffectValue = function() {
  this.effect = {blur:0, hue:0, hsv:0, brightness:0, contrast:0, saturation:0, alpha:1};
};
Entry.EntityObject.prototype.removeBrush = function() {
  Entry.stage.selectedObjectContainer.removeChild(this.shape);
  this.shape = this.brush = null;
};
Entry.EntityObject.prototype.updateBG = function() {
  if (this.bgObject) {
    this.bgObject.graphics.clear();
    var a = this.getWidth(), b = this.getHeight();
    this.bgObject.graphics.setStrokeStyle(1).beginStroke().beginFill(this.getBGColour()).drawRect(-a / 2, -b / 2, a, b);
    if (this.getLineBreak()) {
      this.bgObject.x = 0;
    } else {
      switch(this.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          this.bgObject.x = a / 2;
          break;
        case Entry.TEXT_ALIGN_CENTER:
          this.bgObject.x = 0;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          this.bgObject.x = -a / 2;
      }
    }
  }
};
Entry.EntityObject.prototype.alignTextBox = function() {
  if ("textBox" == this.type) {
    var a = this.textObject;
    if (this.lineBreak) {
      var b = a.getMeasuredLineHeight();
      a.y = b / 2 - this.getHeight() / 2;
      switch(this.textAlign) {
        case Entry.TEXT_ALIGN_CENTER:
          a.x = 0;
          break;
        case Entry.TEXT_ALIGN_LEFT:
          a.x = -this.getWidth() / 2;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          a.x = this.getWidth() / 2;
      }
      a.maxHeight = this.getHeight();
    } else {
      a.x = 0, a.y = 0;
    }
  }
};
Entry.EntityObject.prototype.syncDialogVisible = function() {
  this.dialog && (this.dialog.object.visible = this.visible);
};
Entry.Func = function(a) {
  this.id = a ? a.id : Entry.generateHash();
  this.content = a ? new Entry.Code(a.content) : new Entry.Code([[{type:"function_create", copyable:!1, deletable:!1, x:40, y:40}]]);
  this.blockMenuBlock = this.block = null;
  this.hashMap = {};
  this.paramMap = {};
  var b = function() {
  };
  b.prototype = Entry.block.function_general;
  b = new b;
  b.changeEvent = new Entry.Event;
  b.template = Lang.template.function_general;
  Entry.block["func_" + this.id] = b;
  if (a) {
    a = this.content._blockMap;
    for (var d in a) {
      Entry.Func.registerParamBlock(a[d].type);
    }
    Entry.Func.generateWsBlock(this);
  }
  Entry.Func.registerFunction(this);
  Entry.Func.updateMenu();
};
Entry.Func.threads = {};
Entry.Func.registerFunction = function(a) {
  var b = Entry.playground.mainWorkspace;
  b && (this._targetFuncBlock = b.getBlockMenu().getCategoryCodes("func").createThread([{type:"func_" + a.id}]), a.blockMenuBlock = this._targetFuncBlock);
};
Entry.Func.executeFunction = function(a) {
  var b = this.threads[a];
  if (b = Entry.Engine.computeThread(b.entity, b)) {
    return this.threads[a] = b, !0;
  }
  delete this.threads[a];
  return !1;
};
Entry.Func.clearThreads = function() {
  this.threads = {};
};
Entry.Func.prototype.init = function(a) {
  this.id = a.id;
  this.content = Blockly.Xml.textToDom(a.content);
  this.block = Blockly.Xml.textToDom("<xml>" + a.block + "</xml>").childNodes[0];
};
Entry.Func.prototype.destroy = function() {
  this.blockMenuBlock.destroy();
};
Entry.Func.edit = function(a) {
  this.cancelEdit();
  this.targetFunc = a;
  this.initEditView(a.content);
  this.bindFuncChangeEvent();
  this.updateMenu();
};
Entry.Func.initEditView = function(a) {
  this.menuCode || this.setupMenuCode();
  var b = Entry.playground.mainWorkspace;
  b.setMode(Entry.Workspace.MODE_OVERLAYBOARD);
  b.changeOverlayBoardCode(a);
  this._workspaceStateEvent = b.changeEvent.attach(this, this.endEdit);
};
Entry.Func.endEdit = function(a) {
  this.unbindFuncChangeEvent();
  this._workspaceStateEvent.destroy();
  delete this._workspaceStateEvent;
  switch(a) {
    case "save":
      this.save();
    case "cancelEdit":
      this.cancelEdit();
  }
};
Entry.Func.save = function() {
  this.targetFunc.generateBlock(!0);
  Entry.variableContainer.saveFunction(this.targetFunc);
};
Entry.Func.syncFuncName = function(a) {
  var b = 0;
  a = a.split(" ");
  var d = "", c;
  c = Blockly.mainWorkspace.getAllBlocks();
  for (var e = 0;e < c.length;e++) {
    var f = c[e];
    if ("function_general" === f.type) {
      for (var f = f.inputList, g = 0;g < f.length;g++) {
        var h = f[g];
        0 < h.fieldRow.length && h.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != h.fieldRow[0].text_ && (d += h.fieldRow[0].text_, d += " ");
      }
      d = d.trim();
      if (d === this.srcFName && this.srcFName.split(" ").length == a.length) {
        for (d = 0;d < f.length;d++) {
          if (h = f[d], 0 < h.fieldRow.length && h.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != h.fieldRow[0].text_) {
            if (void 0 === a[b]) {
              f.splice(d, 1);
              break;
            } else {
              h.fieldRow[0].text_ = a[b];
            }
            b++;
          }
        }
      }
      d = "";
      b = 0;
    }
  }
  b = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, b);
};
Entry.Func.cancelEdit = function() {
  this.targetFunc && (Entry.Func.isEdit = !1, this.targetFunc.block || (this._targetFuncBlock.destroy(), delete Entry.variableContainer.functions_[this.targetFunc.id], delete Entry.variableContainer.selected), delete this.targetFunc, this.updateMenu(), Entry.variableContainer.updateList(), Entry.playground.mainWorkspace.setMode(Entry.Workspace.MODE_BOARD));
};
Entry.Func.getMenuXml = function() {
  var a = [];
  this.targetFunc || (a = a.concat(this.createBtn));
  if (this.targetFunc) {
    var b = this.FIELD_BLOCK, b = b.replace("#1", Entry.generateHash()), b = b.replace("#2", Entry.generateHash()), b = Blockly.Xml.textToDom(b).childNodes, a = a.concat(Entry.nodeListToArray(b))
  }
  for (var d in Entry.variableContainer.functions_) {
    b = Entry.variableContainer.functions_[d], b === this.targetFunc ? (b = Entry.Func.generateBlock(this.targetFunc, Blockly.Xml.workspaceToDom(Entry.Func.workspace), b.id).block, a.push(b)) : a.push(b.block);
  }
  return a;
};
Entry.Func.syncFunc = function() {
  var a = Entry.Func;
  if (a.targetFunc) {
    var b = a.workspace.topBlocks_[0].toString(), d = a.workspace.topBlocks_.length;
    (a.fieldText != b || a.workspaceLength != d) && 1 > Blockly.Block.dragMode_ && (a.updateMenu(), a.fieldText = b, a.workspaceLength = d);
  }
};
Entry.Func.setupMenuCode = function() {
  var a = Entry.playground.mainWorkspace;
  a && (a = a.getBlockMenu().getCategoryCodes("func"), this._fieldLabel = a.createThread([{type:"function_field_label"}]).getFirstBlock(), this._fieldString = a.createThread([{type:"function_field_string", params:[{type:this.requestParamBlock("string")}]}]).getFirstBlock(), this._fieldBoolean = a.createThread([{type:"function_field_boolean", params:[{type:this.requestParamBlock("boolean")}]}]).getFirstBlock(), this.menuCode = a);
};
Entry.Func.refreshMenuCode = function() {
  if (Entry.playground.mainWorkspace) {
    this.menuCode || this.setupMenuCode();
    var a = Entry.block[this._fieldString.params[0].type].changeEvent._listeners.length;
    2 < a && this._fieldString.params[0].changeType(this.requestParamBlock("string"));
    a = Entry.block[this._fieldBoolean.params[0].type].changeEvent._listeners.length;
    2 < a && this._fieldBoolean.params[0].changeType(this.requestParamBlock("boolean"));
  }
};
Entry.Func.requestParamBlock = function(a) {
  var b = Entry.generateHash(), d;
  switch(a) {
    case "string":
      d = Entry.block.function_param_string;
      break;
    case "boolean":
      d = Entry.block.function_param_boolean;
      break;
    default:
      return null;
  }
  b = a + "Param_" + b;
  a = Entry.Func.createParamBlock(b, d, a);
  Entry.block[b] = a;
  return b;
};
Entry.Func.registerParamBlock = function(a) {
  -1 < a.indexOf("stringParam") ? Entry.Func.createParamBlock(a, Entry.block.function_param_string, a) : -1 < a.indexOf("booleanParam") && Entry.Func.createParamBlock(a, Entry.block.function_param_boolean, a);
};
Entry.Func.createParamBlock = function(a, b, d) {
  var c = function() {
  };
  d = "string" === d ? "function_param_string" : "function_param_boolean";
  c.prototype = b;
  c = new c;
  c.changeEvent = new Entry.Event;
  c.template = Lang.template[d];
  return Entry.block[a] = c;
};
Entry.Func.updateMenu = function() {
  var a = Entry.playground.mainWorkspace;
  a && (a = a.getBlockMenu(), this.targetFunc ? (this.menuCode || this.setupMenuCode(), a.banClass("functionInit"), a.unbanClass("functionEdit")) : (a.unbanClass("functionInit"), a.banClass("functionEdit")), a.reDraw());
};
Entry.Func.prototype.edit = function() {
  Entry.Func.isEdit || (Entry.Func.isEdit = !0, Entry.Func.svg ? this.parentView.appendChild(this.svg) : Entry.Func.initEditView());
};
Entry.Func.generateBlock = function(a) {
  a = Entry.block["func_" + a.id];
  var b = {template:a.template, params:a.params}, d = /(%\d)/mi, c = a.template.split(d), e = "", f = 0, g = 0, h;
  for (h in c) {
    var k = c[h];
    d.test(k) ? (k = Number(k.split("%")[1]) - 1, k = a.params[k], "Indicator" !== k.type && ("boolean" === k.accept ? (e += Lang.template.function_param_boolean + (f ? f : ""), f++) : (e += Lang.General.param_string + (g ? g : ""), g++))) : e += k;
  }
  return {block:b, description:e};
};
Entry.Func.prototype.generateBlock = function(a) {
  a = Entry.Func.generateBlock(this);
  this.block = a.block;
  this.description = a.description;
};
Entry.Func.generateWsBlock = function(a) {
  this.unbindFuncChangeEvent();
  a = a ? a : this.targetFunc;
  for (var b = a.content.getEventMap("funcDef")[0].params[0], d = 0, c = 0, e = [], f = "", g = a.hashMap, h = a.paramMap;b;) {
    var k = b.params[0];
    switch(b.type) {
      case "function_field_label":
        f = f + " " + k;
        break;
      case "function_field_boolean":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_logical_variable + " " + (d ? d : "")});
        g[k.type] = !1;
        h[k.type] = d + c;
        d++;
        e.push({type:"Block", accept:"boolean"});
        f += " %" + (d + c);
        break;
      case "function_field_string":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_character_variable + " " + (c ? c : "")}), g[k.type] = !1, h[k.type] = d + c, c++, f += " %" + (d + c), e.push({type:"Block", accept:"string"});
    }
    b = b.getOutputBlock();
  }
  d++;
  f += " %" + (d + c);
  e.push({type:"Indicator", img:"block_icon/function_03.png", size:12});
  Entry.Mutator.mutate("func_" + a.id, {params:e, template:f});
  for (var l in g) {
    g[l] ? (b = -1 < l.indexOf("string") ? Lang.Blocks.FUNCTION_character_variable : Lang.Blocks.FUNCTION_logical_variable, Entry.Mutator.mutate(l, {template:b})) : g[l] = !0;
  }
  this.bindFuncChangeEvent(a);
};
Entry.Func.bindFuncChangeEvent = function(a) {
  a = a ? a : this.targetFunc;
  !this._funcChangeEvent && a.content.getEventMap("funcDef")[0].view && (this._funcChangeEvent = a.content.getEventMap("funcDef")[0].view._contents[1].changeEvent.attach(this, this.generateWsBlock));
};
Entry.Func.unbindFuncChangeEvent = function() {
  this._funcChangeEvent && this._funcChangeEvent.destroy();
  delete this._funcChangeEvent;
};
Entry.Helper = function() {
  this.visible = !1;
};
p = Entry.Helper.prototype;
p.generateView = function(a, b) {
  this.parentView_ || (this.parentView_ = a, this.blockHelpData = EntryStatic.blockInfo, this.view = a = Entry.createElement("div", "entryBlockHelperWorkspace"), Entry.isForLecture && a.addClass("lecture"), this.parentView_.appendChild(a), Entry.isForLecture || (b = Entry.createElement("div", "entryBlockHelperHeaderWorkspace"), b.innerHTML = Lang.Helper.Block_info, a.appendChild(b)), b = Entry.createElement("div", "entryBlockHelperContentWorkspace"), b.addClass("entryBlockHelperIntro"), Entry.isForLecture && 
  b.addClass("lecture"), a.appendChild(b), this.blockHelperContent_ = b, this.blockHelperView_ = a, a = Entry.createElement("div", "entryBlockHelperBlockWorkspace"), this.blockHelperContent_.appendChild(a), b = Entry.createElement("div", "entryBlockHelperDescriptionWorkspace"), this.blockHelperContent_.appendChild(b), b.innerHTML = Lang.Helper.Block_click_msg, this.blockHelperDescription_ = b, this._renderView = new Entry.RenderView($(a), "LEFT"), this.code = new Entry.Code([]), this._renderView.changeCode(this.code), 
  this.first = !0);
};
p.bindWorkspace = function(a) {
  a && (this._blockViewObserver && this._blockViewObserver.destroy(), this.workspace = a, this._blockViewObserver = a.observe(this, "_updateSelectedBlock", ["selectedBlockView"]));
};
p._updateSelectedBlock = function() {
  var a = this.workspace.selectedBlockView;
  if (a && this.visible && a != this._blockView) {
    var b = a.block.type;
    this._blockView = a;
    this.renderBlock(b);
  }
};
p.renderBlock = function(a) {
  var b = Lang.Helper[a];
  if (a && this.visible && b && !Entry.block[a].isPrimitive) {
    this.first && (this.blockHelperContent_.removeClass("entryBlockHelperIntro"), this.first = !1);
    this.code.clear();
    var d = Entry.block[a].def, d = d || {type:a};
    this.code.createThread([d]);
    this.code.board.align();
    this.code.board.resize();
    var d = this.code.getThreads()[0].getFirstBlock().view, c = d.svgGroup.getBBox();
    a = c.width;
    c = c.height;
    d = d.getSkeleton().box(d).offsetX;
    isNaN(d) && (d = 0);
    this.blockHelperDescription_.innerHTML = b;
    this._renderView.align();
    $(this.blockHelperDescription_).css({top:c + 30});
    this._renderView.svgDom.css({"margin-left":-(a / 2) - 20 - d});
  }
};
p.getView = function() {
  return this.view;
};
p.resize = function() {
};
Entry.HWMontior = {};
Entry.HWMonitor = function(a) {
  this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  this._hwModule = a;
  var b = this;
  Entry.addEventListener("windowResized", function() {
    var a = b._hwModule.monitorTemplate.mode;
    "both" == a && (b.resize(), b.resizeList());
    "list" == a ? b.resizeList() : b.resize();
  });
  Entry.addEventListener("hwModeChange", function() {
    b.changeMode();
  });
  this.changeOffset = 0;
  this.scale = .5;
  this._listPortViews = {};
};
(function(a) {
  a.initView = function() {
    this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  };
  a.generateView = function() {
    this.snap = Entry.SVG("hwMonitor");
    this._svgGroup = this.snap.elem("g");
    this._portMap = {n:[], e:[], s:[], w:[]};
    var b = this._hwModule.monitorTemplate, a = {href:Entry.mediaFilePath + b.imgPath, x:-b.width / 2, y:-b.height / 2, width:b.width, height:b.height};
    this._portViews = {};
    this.hwView = this._svgGroup.elem("image");
    this.hwView = this.hwView.attr(a);
    this._template = b;
    b = b.ports;
    this.pathGroup = null;
    this.pathGroup = this._svgGroup.elem("g");
    var a = [], c;
    for (c in b) {
      var e = this.generatePortView(b[c], "_svgGroup");
      this._portViews[c] = e;
      a.push(e);
    }
    a.sort(function(b, a) {
      return b.box.x - a.box.x;
    });
    var f = this._portMap;
    a.map(function(b) {
      (1 > (Math.atan2(-b.box.y, b.box.x) / Math.PI + 2) % 2 ? f.n : f.s).push(b);
    });
    this.resize();
  };
  a.toggleMode = function(b) {
    var a = this._hwModule.monitorTemplate;
    "list" == b ? (a.TempPort = null, this._hwModule.monitorTemplate.ports && (this._hwModule.monitorTemplate.TempPort = this._hwModule.monitorTemplate.ports, this._hwModule.monitorTemplate.listPorts = this.addPortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._svgGroup && $(this._svgGroup).remove(), $(this._pathGroup).remove(), this._hwModule.monitorTemplate.mode = "list", this.generateListView()) : (this._hwModule.monitorTemplate.TempPort && 
    (this._hwModule.monitorTemplate.ports = this._hwModule.monitorTemplate.TempPort, this._hwModule.monitorTemplate.listPorts = this.removePortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._hwModule.monitorTemplate.mode = "both", this.generateListView(), this.generateView());
  };
  a.setHwmonitor = function(b) {
    this._hwmodule = b;
  };
  a.changeMode = function(b) {
    "both" == this._hwModule.monitorTemplate.mode ? this.toggleMode("list") : "list" == this._hwModule.monitorTemplate.mode && this.toggleMode("both");
  };
  a.addPortEle = function(b, a) {
    if ("object" != typeof a) {
      return b;
    }
    for (var c in a) {
      b[c] = a[c];
    }
    return b;
  };
  a.removePortEle = function(b, a) {
    if ("object" != typeof a) {
      return b;
    }
    for (var c in a) {
      delete b[c];
    }
    return b;
  };
  a.generateListView = function() {
    this._portMapList = {n:[]};
    this._svglistGroup = null;
    this.listsnap = Entry.SVG("hwMonitor");
    this._svglistGroup = this.listsnap.elem("g");
    var b = this._hwModule.monitorTemplate;
    this._template = b;
    b = b.listPorts;
    this.pathGroup = this._svglistGroup.elem("g");
    var a = [], c;
    for (c in b) {
      var e = this.generatePortView(b[c], "_svglistGroup");
      this._listPortViews[c] = e;
      a.push(e);
    }
    var f = this._portMapList;
    a.map(function(b) {
      f.n.push(b);
    });
    this.resizeList();
  };
  a.generatePortView = function(b, a) {
    a = this[a].elem("g");
    a.addClass("hwComponent");
    var c;
    c = this.pathGroup.elem("path").attr({d:"m0,0", fill:"none", stroke:"input" === b.type ? "#00979d" : "#A751E3", "stroke-width":3});
    var e = a.elem("rect").attr({x:0, y:0, width:150, height:22, rx:4, ry:4, fill:"#fff", stroke:"#a0a1a1"}), f = a.elem("text").attr({x:4, y:12, fill:"#000", "class":"hwComponentName", "alignment-baseline":"central"});
    f.textContent = b.name;
    f = f.getComputedTextLength();
    a.elem("rect").attr({x:f + 8, y:2, width:30, height:18, rx:9, ry:9, fill:"input" === b.type ? "#00979d" : "#A751E3"});
    var g = a.elem("text").attr({x:f + 13, y:12, fill:"#fff", "class":"hwComponentValue", "alignment-baseline":"central"});
    g.textContent = 0;
    f += 40;
    e.attr({width:f});
    return {group:a, value:g, type:b.type, path:c, box:{x:b.pos.x - this._template.width / 2, y:b.pos.y - this._template.height / 2, width:f}, width:f};
  };
  a.getView = function() {
    return this.svgDom;
  };
  a.update = function() {
    var b = Entry.hw.portData, a = Entry.hw.sendQueue, c = this._hwModule.monitorTemplate.mode, e = this._hwModule.monitorTemplate.keys || [], f = [];
    if ("list" == c) {
      f = this._listPortViews;
    } else {
      if ("both" == c) {
        if (f = this._listPortViews, this._portViews) {
          for (var g in this._portViews) {
            f[g] = this._portViews[g];
          }
        }
      } else {
        f = this._portViews;
      }
    }
    if (a) {
      for (g in a) {
        0 != a[g] && f[g] && (f[g].type = "output");
      }
    }
    for (var h in f) {
      if (c = f[h], "input" == c.type) {
        var k = b[h];
        0 < e.length && $.each(e, function(b, a) {
          if ($.isPlainObject(k)) {
            k = k[a] || 0;
          } else {
            return !1;
          }
        });
        c.value.textContent = k ? k : 0;
        c.group.getElementsByTagName("rect")[1].attr({fill:"#00979D"});
      } else {
        k = a[h], 0 < e.length && $.each(e, function(b, a) {
          if ($.isPlainObject(k)) {
            k = k[a] || 0;
          } else {
            return !1;
          }
        }), c.value.textContent = k ? k : 0, c.group.getElementsByTagName("rect")[1].attr({fill:"#A751E3"});
      }
    }
  };
  a.resize = function() {
    this.hwView && this.hwView.attr({transform:"scale(" + this.scale + ")"});
    if (this.svgDom) {
      var b = this.svgDom.get(0).getBoundingClientRect()
    }
    this._svgGroup.attr({transform:"translate(" + b.width / 2 + "," + b.height / 1.8 + ")"});
    this._rect = b;
    0 >= this._template.height || 0 >= b.height || (this.scale = b.height / this._template.height * this._template.height / 1E3, this.align());
  };
  a.resizeList = function() {
    var b = this.svgDom.get(0).getBoundingClientRect();
    this._svglistGroup.attr({transform:"translate(" + b.width / 2 + "," + b.height / 2 + ")"});
    this._rect = b;
    this.alignList();
  };
  a.align = function() {
    var b;
    b = this._portMap.s.concat();
    this._alignNS(b, this.scale / 3 * this._template.height + 5, 27);
    b = this._portMap.n.concat();
    this._alignNS(b, -this._template.height * this.scale / 3 - 32, -27);
    b = this._portMap.e.concat();
    this._alignEW(b, -this._template.width * this.scale / 3 - 5, -27);
    b = this._portMap.w.concat();
    this._alignEW(b, this._template.width * this.scale / 3 - 32, -27);
  };
  a.alignList = function() {
    var b;
    b = this._hwModule.monitorTemplate.listPorts;
    for (var a = b.length, c = 0;c < b.length;c++) {
      b[c].group.attr({transform:"translate(" + this._template.width * (c / a - .5) + "," + (-this._template.width / 2 - 30) + ")"});
    }
    b = this._portMapList.n.concat();
    this._alignNSList(b, -this._template.width * this.scale / 2 - 32, -27);
  };
  a._alignEW = function(b, a, c) {
    var e = b.length, f = this._rect.height - 50;
    tP = -f / 2;
    bP = f / 2;
    height = this._rect.height;
    listVLine = wholeHeight = 0;
    mode = this._hwModule.monitorTemplate;
    for (f = 0;f < e;f++) {
      wholeHeight += b[f].height + 5;
    }
    wholeHeight < bP - tP && (bP = wholeHeight / 2 + 3, tP = -wholeHeight / 2 - 3);
    for (;1 < e;) {
      var g = b.shift(), f = b.pop(), h = tP, k = bP, l = c;
      wholeWidth <= bP - tP ? (tP += g.width + 5, bP -= f.width + 5, l = 0) : 0 === b.length ? (tP = (tP + bP) / 2 - 3, bP = tP + 6) : (tP = Math.max(tP, -width / 2 + g.width) + 15, bP = Math.min(bP, width / 2 - f.width) - 15);
      wholeWidth -= g.width + f.width + 10;
      a += l;
    }
    b.length && b[0].group.attr({transform:"translate(" + a + ",60)"});
    g && rPort && (this._movePort(g, a, tP, h), this._movePort(rPort, a, bP, k));
  };
  a._alignNS = function(b, a, c) {
    for (var e = -this._rect.width / 2, f = this._rect.width / 2, g = this._rect.width, h = 0, k = 0;k < b.length;k++) {
      h += b[k].width + 5;
    }
    h < f - e && (f = h / 2 + 3, e = -h / 2 - 3);
    for (;1 < b.length;) {
      var k = b.shift(), l = b.pop(), m = e, n = f, q = c;
      h <= f - e ? (e += k.width + 5, f -= l.width + 5, q = 0) : 0 === b.length ? (e = (e + f) / 2 - 3, f = e + 6) : (e = Math.max(e, -g / 2 + k.width) + 15, f = Math.min(f, g / 2 - l.width) - 15);
      this._movePort(k, e, a, m);
      this._movePort(l, f, a, n);
      h -= k.width + l.width + 10;
      a += q;
    }
    b.length && this._movePort(b[0], (f + e - b[0].width) / 2, a, 100);
  };
  a._alignNSList = function(b, a) {
    a = this._rect.width;
    initX = -this._rect.width / 2 + 10;
    initY = -this._rect.height / 2 + 10;
    for (var c = listLine = wholeWidth = 0;c < b.length;c++) {
      wholeWidth += b[c].width;
    }
    for (var e = 0, f = 0, g = initX, h, k, l = 0, c = 0;c < b.length;c++) {
      k = b[c], c != b.length - 1 && (l = b[c + 1]), f += k.width, lP = initX, h = initY + 30 * e, k.group.attr({transform:"translate(" + lP + "," + h + ")"}), initX += k.width + 10, f > a - (k.width + l.width / 2.2) && (e += 1, initX = g, f = 0);
    }
  };
  a._movePort = function(b, a, c, e) {
    var f = a, g = b.box.x * this.scale, h = b.box.y * this.scale;
    a > e ? (f = a - b.width, a = a > g && g > e ? "M" + g + "," + c + "L" + g + "," + h : "M" + (a + e) / 2 + "," + c + "l0," + (h > c ? 28 : -3) + "H" + g + "L" + g + "," + h) : a = a < g && g < e ? "m" + g + "," + c + "L" + g + "," + h : "m" + (e + a) / 2 + "," + c + "l0," + (h > c ? 28 : -3) + "H" + g + "L" + g + "," + h;
    b.group.attr({transform:"translate(" + f + "," + c + ")"});
    b.path.attr({d:a});
  };
})(Entry.HWMonitor.prototype);
Entry.HW = function() {
  this.connectTrial = 0;
  this.isFirstConnect = !0;
  this.initSocket();
  this.connected = !1;
  this.portData = {};
  this.sendQueue = {};
  this.outputQueue = {};
  this.settingQueue = {};
  this.socketType = this.hwModule = this.selectedDevice = null;
  Entry.addEventListener("stop", this.setZero);
  this.hwInfo = {11:Entry.Arduino, 12:Entry.SensorBoard, 13:Entry.CODEino, 15:Entry.dplay, 16:Entry.nemoino, 17:Entry.Xbot, 24:Entry.Hamster, 25:Entry.Albert, 31:Entry.Bitbrick, 42:Entry.Arduino, 51:Entry.Neobot, 71:Entry.Robotis_carCont, 72:Entry.Robotis_openCM70, 81:Entry.Arduino};
};
Entry.HW.TRIAL_LIMIT = 1;
p = Entry.HW.prototype;
p.initSocket = function() {
  try {
    if (this.connectTrial >= Entry.HW.TRIAL_LIMIT) {
      this.isFirstConnect || Entry.toast.alert(Lang.Menus.connect_hw, Lang.Menus.connect_fail, !1), this.isFirstConnect = !1;
    } else {
      var a = this, b, d;
      this.connected = !1;
      this.connectTrial++;
      if (-1 < location.protocol.indexOf("https")) {
        d = new WebSocket("wss://hardware.play-entry.org:23518");
      } else {
        try {
          b = new WebSocket("ws://127.0.0.1:23518"), b.binaryType = "arraybuffer", b.onopen = function() {
            a.socketType = "WebSocket";
            a.initHardware(b);
          }.bind(this), b.onmessage = function(b) {
            b = JSON.parse(b.data);
            a.checkDevice(b);
            a.updatePortData(b);
          }.bind(this), b.onclose = function() {
            "WebSocket" === a.socketType && (this.socket = null, a.initSocket());
          };
        } catch (c) {
        }
        try {
          d = new WebSocket("wss://hardware.play-entry.org:23518");
        } catch (c) {
        }
      }
      d.binaryType = "arraybuffer";
      d.onopen = function() {
        a.socketType = "WebSocketSecurity";
        a.initHardware(d);
      };
      d.onmessage = function(b) {
        b = JSON.parse(b.data);
        a.checkDevice(b);
        a.updatePortData(b);
      };
      d.onclose = function() {
        "WebSocketSecurity" === a.socketType && (this.socket = null, a.initSocket());
      };
      Entry.dispatchEvent("hwChanged");
    }
  } catch (c) {
  }
};
p.retryConnect = function() {
  this.connectTrial = 0;
  this.initSocket();
};
p.initHardware = function(a) {
  this.socket = a;
  this.connectTrial = 0;
  this.connected = !0;
  Entry.dispatchEvent("hwChanged");
  Entry.playground && Entry.playground.object && Entry.playground.setMenu(Entry.playground.object.objectType);
};
p.setDigitalPortValue = function(a, b) {
  this.sendQueue[a] = b;
  this.removePortReadable(a);
};
p.getAnalogPortValue = function(a) {
  return this.connected ? this.portData["a" + a] : 0;
};
p.getDigitalPortValue = function(a) {
  if (!this.connected) {
    return 0;
  }
  this.setPortReadable(a);
  return void 0 !== this.portData[a] ? this.portData[a] : 0;
};
p.setPortReadable = function(a) {
  this.sendQueue.readablePorts || (this.sendQueue.readablePorts = []);
  var b = !1, d;
  for (d in this.sendQueue.readablePorts) {
    if (this.sendQueue.readablePorts[d] == a) {
      b = !0;
      break;
    }
  }
  b || this.sendQueue.readablePorts.push(a);
};
p.removePortReadable = function(a) {
  if (this.sendQueue.readablePorts || Array.isArray(this.sendQueue.readablePorts)) {
    var b, d;
    for (d in this.sendQueue.readablePorts) {
      if (this.sendQueue.readablePorts[d] == a) {
        b = Number(d);
        break;
      }
    }
    this.sendQueue.readablePorts = void 0 != b ? this.sendQueue.readablePorts.slice(0, b).concat(this.sendQueue.readablePorts.slice(b + 1, this.sendQueue.readablePorts.length)) : [];
  }
};
p.update = function() {
  this.socket && 1 == this.socket.readyState && this.socket.send(JSON.stringify(this.sendQueue));
};
p.updatePortData = function(a) {
  this.portData = a;
  this.hwMonitor && this.hwMonitor.update();
};
p.closeConnection = function() {
  this.socket && this.socket.close();
};
p.downloadConnector = function() {
  window.open("http://download.play-entry.org/apps/Entry_HW_1.5.3_Setup.exe", "_blank").focus();
};
p.downloadSource = function() {
  window.open("http://play-entry.com/down/board.ino", "_blank").focus();
};
p.setZero = function() {
  Entry.hw.hwModule && Entry.hw.hwModule.setZero();
};
p.checkDevice = function(a) {
  void 0 !== a.company && (a = "" + a.company + a.model, a != this.selectedDevice && (this.selectedDevice = a, this.hwModule = this.hwInfo[a], Entry.dispatchEvent("hwChanged"), Entry.toast.success("\ud558\ub4dc\uc6e8\uc5b4 \uc5f0\uacb0 \uc131\uacf5", "\ud558\ub4dc\uc6e8\uc5b4 \uc544\uc774\ucf58\uc744 \ub354\ube14\ud074\ub9ad\ud558\uba74, \uc13c\uc11c\uac12\ub9cc \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.", !0), this.hwModule.monitorTemplate && (this.hwMonitor ? (this.hwMonitor._hwModule = 
  this.hwModule, this.hwMonitor.initView()) : this.hwMonitor = new Entry.HWMonitor(this.hwModule), Entry.propertyPanel.addMode("hw", this.hwMonitor), a = this.hwModule.monitorTemplate, "both" == a.mode ? (a.mode = "list", this.hwMonitor.generateListView(), a.mode = "general", this.hwMonitor.generateView(), a.mode = "both") : "list" == a.mode ? this.hwMonitor.generateListView() : this.hwMonitor.generateView())));
};
p.banHW = function() {
  var a = this.hwInfo, b;
  for (b in a) {
    Entry.playground.mainWorkspace.blockMenu.banClass(a[b].name, !0);
  }
};
Entry.PropertyPanel = function() {
  this.modes = {};
  this.selected = null;
};
(function(a) {
  a.generateView = function(b, a) {
    this._view = Entry.Dom("div", {class:"propertyPanel", parent:$(b)});
    this._tabView = Entry.Dom("div", {class:"propertyTab", parent:this._view});
    this._contentView = Entry.Dom("div", {class:"propertyContent", parent:this._view});
    b = Entry.createElement("div");
    b.addClass("entryObjectSelectedImgWorkspace");
    this.selectedImgView_ = b;
    this._view.append(b);
    this.initializeSplitter(b);
    this.splitter = b;
  };
  a.addMode = function(b, a) {
    var c = a.getView(), c = Entry.Dom(c, {parent:this._contentView}), e = Entry.Dom("<div>" + Lang.Menus[b] + "</div>", {classes:["propertyTabElement", "propertyTab" + b], parent:this._tabView}), f = this;
    e.bind("click", function() {
      f.select(b);
    });
    this.modes[b] && (this.modes[b].tabDom.remove(), this.modes[b].contentDom.remove(), "hw" == b && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    this.modes[b] = {obj:a, tabDom:e, contentDom:c};
    "hw" == b && $(".propertyTabhw").bind("dblclick", function() {
      Entry.dispatchEvent("hwModeChange");
    });
  };
  a.resize = function(b) {
    this._view.css({width:b + "px", top:9 * b / 16 + 123 - 22 + "px"});
    430 <= b ? this._view.removeClass("collapsed") : this._view.addClass("collapsed");
    Entry.dispatchEvent("windowResized");
    (b = this.modes[this.selected].obj.resize) && "hw" != this.selected ? b() : "hw" == this.selected && this.modes.hw.obj.listPorts ? this.modes[this.selected].obj.resizeList() : "hw" == this.selected && this.modes[this.selected].obj.resize();
  };
  a.select = function(b) {
    for (var a in this.modes) {
      var c = this.modes[a];
      c.tabDom.removeClass("selected");
      c.contentDom.addClass("entryRemove");
      c.obj.visible = !1;
    }
    a = this.modes[b];
    a.tabDom.addClass("selected");
    a.contentDom.removeClass("entryRemove");
    a.obj.resize && a.obj.resize();
    a.obj.visible = !0;
    this.selected = b;
  };
  a.initializeSplitter = function(b) {
    b.onmousedown = function(b) {
      Entry.container.disableSort();
      Entry.container.splitterEnable = !0;
      Entry.documentMousemove && (Entry.container.resizeEvent = Entry.documentMousemove.attach(this, function(b) {
        Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:b.clientX || b.x});
      }));
    };
    document.addEventListener("mouseup", function(b) {
      if (b = Entry.container.resizeEvent) {
        Entry.container.splitterEnable = !1, Entry.documentMousemove.detach(b), delete Entry.container.resizeEvent;
      }
      Entry.container.enableSort();
    });
  };
})(Entry.PropertyPanel.prototype);
Entry.init = function(a, b) {
  Entry.assert("object" === typeof b, "Init option is not object");
  this.events_ = {};
  this.interfaceState = {menuWidth:264};
  Entry.Utils.bindGlobalEvent("resize mousedown mousemove keydown keyup dispose".split(" "));
  this.options = b;
  this.parseOptions(b);
  this.mediaFilePath = (b.libDir ? b.libDir : "/lib") + "/entryjs/images/";
  this.defaultPath = b.defaultDir || "";
  this.blockInjectPath = b.blockInjectDir || "";
  "workspace" == this.type && this.isPhone() && (this.type = "phone");
  this.initialize_();
  this.view_ = a;
  this.view_.setAttribute("class", "entry");
  Entry.initFonts(b.fonts);
  this.createDom(a, this.type);
  this.loadInterfaceState();
  this.overridePrototype();
  this.maxCloneLimit = 302;
  this.cloudSavable = !0;
  this.startTime = (new Date).getTime();
  document.onkeydown = function(b) {
    Entry.dispatchEvent("keyPressed", b);
  };
  document.onkeyup = function(b) {
    Entry.dispatchEvent("keyUpped", b);
  };
  window.onresize = function(b) {
    Entry.dispatchEvent("windowResized", b);
  };
  window.onbeforeunload = this.beforeUnload;
  Entry.addEventListener("saveWorkspace", function(b) {
    Entry.addActivity("save");
  });
  "IE" != Entry.getBrowserType().substr(0, 2) || window.flashaudio ? createjs.Sound.registerPlugins([createjs.WebAudioPlugin]) : (createjs.FlashAudioPlugin.swfPath = this.mediaFilePath + "media/", createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]), window.flashaudio = !0);
  Entry.soundQueue = new createjs.LoadQueue;
  Entry.soundQueue.installPlugin(createjs.Sound);
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/click.mp3", Entry.mediaFilePath + "sounds/click.wav", Entry.mediaFilePath + "sounds/click.ogg"], "entryMagneting");
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/delete.mp3", Entry.mediaFilePath + "sounds/delete.ogg", Entry.mediaFilePath + "sounds/delete.wav"], "entryDelete");
  createjs.Sound.stop();
};
Entry.loadAudio_ = function(a, b) {
  if (window.Audio && a.length) {
    for (;0 < a.length;) {
      a = a[0];
      a.match(/\/([^.]+)./);
      Entry.soundQueue.loadFile({id:b, src:a, type:createjs.LoadQueue.SOUND});
      break;
    }
  }
};
Entry.initialize_ = function() {
  this.stage = new Entry.Stage;
  Entry.engine && Entry.engine.clearTimer();
  this.engine = new Entry.Engine;
  this.propertyPanel = new Entry.PropertyPanel;
  this.container = new Entry.Container;
  this.helper = new Entry.Helper;
  this.youtube = new Entry.Youtube;
  this.variableContainer = new Entry.VariableContainer;
  this.commander = new Entry.Commander(this.type);
  this.scene = new Entry.Scene;
  this.playground = new Entry.Playground;
  this.toast = new Entry.Toast;
  this.hw && this.hw.closeConnection();
  this.hw = new Entry.HW;
  if (Entry.enableActivityLogging) {
    this.reporter = new Entry.Reporter(!1);
  } else {
    if ("workspace" == this.type || "phone" == this.type) {
      this.reporter = new Entry.Reporter(!0);
    }
  }
};
Entry.createDom = function(a, b) {
  if (b && "workspace" != b) {
    "minimize" == b ? (d = Entry.createElement("canvas"), d.className = "entryCanvasWorkspace", d.id = "entryCanvas", d.width = 640, d.height = 360, c = Entry.createElement("div", "entryCanvasWrapper"), c.appendChild(d), a.appendChild(c), this.canvas_ = d, this.stage.initStage(this.canvas_), c = Entry.createElement("div"), a.appendChild(c), this.engineView = c, this.engine.generateView(this.engineView, b)) : "phone" == b && (this.stateManagerView = d = Entry.createElement("div"), this.stateManager.generateView(this.stateManagerView, 
    b), c = Entry.createElement("div"), a.appendChild(c), this.engineView = c, this.engine.generateView(this.engineView, b), d = Entry.createElement("canvas"), d.addClass("entryCanvasPhone"), d.id = "entryCanvas", d.width = 640, d.height = 360, c.insertBefore(d, this.engine.footerView_), this.canvas_ = d, this.stage.initStage(this.canvas_), d = Entry.createElement("div"), a.appendChild(d), this.containerView = d, this.container.generateView(this.containerView, b), d = Entry.createElement("div"), 
    a.appendChild(d), this.playgroundView = d, this.playground.generateView(this.playgroundView, b));
  } else {
    Entry.documentMousedown.attach(this, this.cancelObjectEdit);
    var d = Entry.createElement("div");
    a.appendChild(d);
    this.sceneView = d;
    this.scene.generateView(this.sceneView, b);
    d = Entry.createElement("div");
    this.sceneView.appendChild(d);
    this.stateManagerView = d;
    this.stateManager.generateView(this.stateManagerView, b);
    var c = Entry.createElement("div");
    a.appendChild(c);
    this.engineView = c;
    this.engine.generateView(this.engineView, b);
    d = Entry.createElement("canvas");
    d.addClass("entryCanvasWorkspace");
    d.id = "entryCanvas";
    d.width = 640;
    d.height = 360;
    c.insertBefore(d, this.engine.addButton);
    d.addEventListener("mousewheel", function(b) {
      var a = Entry.variableContainer.getListById(Entry.stage.mouseCoordinate);
      b = 0 < b.wheelDelta ? !0 : !1;
      for (var d = 0;d < a.length;d++) {
        var c = a[d];
        c.scrollButton_.y = b ? 46 <= c.scrollButton_.y ? c.scrollButton_.y - 23 : 23 : c.scrollButton_.y + 23;
        c.updateView();
      }
    });
    this.canvas_ = d;
    this.stage.initStage(this.canvas_);
    d = Entry.createElement("div");
    this.propertyPanel.generateView(a, b);
    this.containerView = d;
    this.container.generateView(this.containerView, b);
    this.propertyPanel.addMode("object", this.container);
    this.helper.generateView(this.containerView, b);
    this.propertyPanel.addMode("helper", this.helper);
    d = Entry.createElement("div");
    a.appendChild(d);
    this.playgroundView = d;
    this.playground.generateView(this.playgroundView, b);
    this.propertyPanel.select("object");
    this.helper.bindWorkspace(this.playground.mainWorkspace);
  }
};
Entry.start = function(a) {
  this.FPS || (this.FPS = 60);
  Entry.assert("number" == typeof this.FPS, "FPS must be number");
  Entry.engine.start(this.FPS);
};
Entry.parseOptions = function(a) {
  this.type = a.type;
  this.projectSaveable = a.projectsaveable;
  void 0 === this.projectSaveable && (this.projectSaveable = !0);
  this.objectAddable = a.objectaddable;
  void 0 === this.objectAddable && (this.objectAddable = !0);
  this.objectEditable = a.objectEditable;
  void 0 === this.objectEditable && (this.objectEditable = !0);
  this.objectEditable || (this.objectAddable = !1);
  this.objectDeletable = a.objectdeletable;
  void 0 === this.objectDeletable && (this.objectDeletable = !0);
  this.soundEditable = a.soundeditable;
  void 0 === this.soundEditable && (this.soundEditable = !0);
  this.pictureEditable = a.pictureeditable;
  void 0 === this.pictureEditable && (this.pictureEditable = !0);
  this.sceneEditable = a.sceneEditable;
  void 0 === this.sceneEditable && (this.sceneEditable = !0);
  this.functionEnable = a.functionEnable;
  void 0 === this.functionEnable && (this.functionEnable = !0);
  this.messageEnable = a.messageEnable;
  void 0 === this.messageEnable && (this.messageEnable = !0);
  this.variableEnable = a.variableEnable;
  void 0 === this.variableEnable && (this.variableEnable = !0);
  this.listEnable = a.listEnable;
  void 0 === this.listEnable && (this.listEnable = !0);
  this.hasVariableManager = a.hasvariablemanager;
  this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable ? void 0 === this.hasVariableManager && (this.hasVariableManager = !0) : this.hasVariableManager = !1;
  this.isForLecture = a.isForLecture;
};
Entry.initFonts = function(a) {
  this.fonts = a;
  a || (this.fonts = []);
};
Entry.Activity = function(a, b) {
  this.name = a;
  this.timestamp = new Date;
  a = [];
  if (void 0 !== b) {
    for (var d = 0, c = b.length;d < c;d++) {
      var e = b[d];
      a.push({key:e[0], value:e[1]});
    }
  }
  this.data = a;
};
Entry.ActivityReporter = function() {
  this._activities = [];
};
(function(a) {
  a.add = function(b) {
    if (!(b instanceof Entry.Activity)) {
      return console.error("Activity must be an instanceof Entry.MazeActivity");
    }
    this._activities.push(b);
  };
  a.clear = function() {
    this._activities = [];
  };
  a.get = function() {
    return this._activities;
  };
})(Entry.ActivityReporter.prototype);
Entry.State = function(a, b, d, c) {
  this.caller = b;
  this.func = d;
  3 < arguments.length && (this.params = Array.prototype.slice.call(arguments).slice(3));
  this.message = a;
  this.time = Entry.getUpTime();
  this.isPass = Entry.Command[a] ? Entry.Command[a].isPass : !1;
};
Entry.State.prototype.generateMessage = function() {
};
Entry.StateManager = function() {
  this.undoStack_ = [];
  this.redoStack_ = [];
  this.isIgnore = this.isRestore = !1;
  Entry.addEventListener("cancelLastCommand", function(a) {
    Entry.stateManager.cancelLastCommand();
  });
  Entry.addEventListener("run", function(a) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("stop", function(a) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("saveWorkspace", function(a) {
    Entry.stateManager.addStamp();
  });
  Entry.addEventListener("undo", function(a) {
    Entry.stateManager.undo();
  });
  Entry.addEventListener("redo", function(a) {
    Entry.stateManager.redo();
  });
};
Entry.StateManager.prototype.generateView = function(a, b) {
};
Entry.StateManager.prototype.addCommand = function(a, b, d, c) {
  if (!this.isIgnoring()) {
    if (this.isRestoring()) {
      var e = new Entry.State, f = Array.prototype.slice.call(arguments);
      Entry.State.prototype.constructor.apply(e, f);
      this.redoStack_.push(e);
      Entry.reporter && Entry.reporter.report(e);
    } else {
      e = new Entry.State, f = Array.prototype.slice.call(arguments), Entry.State.prototype.constructor.apply(e, f), this.undoStack_.push(e), Entry.reporter && Entry.reporter.report(e), this.updateView();
    }
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.cancelLastCommand = function() {
  this.canUndo() && (this.undoStack_.pop(), this.updateView(), Entry.creationChangedEvent && Entry.creationChangedEvent.notify());
};
Entry.StateManager.prototype.getLastCommand = function() {
  return this.undoStack_[this.undoStack_.length - 1];
};
Entry.StateManager.prototype.undo = function() {
  if (this.canUndo() && !this.isRestoring()) {
    this.addActivity("undo");
    for (this.startRestore();this.undoStack_.length;) {
      var a = this.undoStack_.pop();
      a.func.apply(a.caller, a.params);
      if (!0 !== a.isPass) {
        break;
      }
    }
    this.updateView();
    this.endRestore();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.redo = function() {
  if (this.canRedo() && !this.isRestoring()) {
    this.addActivity("redo");
    var a = this.redoStack_.pop();
    a.func.apply(a.caller, a.params);
    this.updateView();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.updateView = function() {
  this.undoButton && this.redoButton && (this.canUndo() ? this.undoButton.addClass("active") : this.undoButton.removeClass("active"), this.canRedo() ? this.redoButton.addClass("active") : this.redoButton.removeClass("active"));
};
Entry.StateManager.prototype.startRestore = function() {
  this.isRestore = !0;
};
Entry.StateManager.prototype.endRestore = function() {
  this.isRestore = !1;
};
Entry.StateManager.prototype.isRestoring = function() {
  return this.isRestore;
};
Entry.StateManager.prototype.startIgnore = function() {
  this.isIgnore = !0;
};
Entry.StateManager.prototype.endIgnore = function() {
  this.isIgnore = !1;
};
Entry.StateManager.prototype.isIgnoring = function() {
  return this.isIgnore;
};
Entry.StateManager.prototype.canUndo = function() {
  return 0 < this.undoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.canRedo = function() {
  return 0 < this.redoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.addStamp = function() {
  this.stamp = Entry.generateHash();
  this.undoStack_.length && (this.undoStack_[this.undoStack_.length - 1].stamp = this.stamp);
};
Entry.StateManager.prototype.isSaved = function() {
  return 0 === this.undoStack_.length || this.undoStack_[this.undoStack_.length - 1].stamp == this.stamp && "string" == typeof this.stamp;
};
Entry.StateManager.prototype.addActivity = function(a) {
  Entry.reporter && Entry.reporter.report(new Entry.State(a));
};
Entry.STATIC = {OBJECT:0, ENTITY:1, SPRITE:2, SOUND:3, VARIABLE:4, FUNCTION:5, SCENE:6, MESSAGE:7, BLOCK_MODEL:8, BLOCK_RENDER_MODEL:9, BOX_MODEL:10, THREAD_MODEL:11, DRAG_INSTANCE:12, BLOCK_STATIC:0, BLOCK_MOVE:1, BLOCK_FOLLOW:2, RETURN:0, CONTINUE:1, BREAK:2, PASS:3};
Entry.BlockModel = function() {
  Entry.Model(this);
};
Entry.BlockModel.prototype.schema = {id:null, x:0, y:0, type:null, params:{}, statements:{}, prev:null, next:null, view:null};
Entry.BlockRenderModel = function() {
  Entry.Model(this);
};
Entry.BlockRenderModel.prototype.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, width:0, height:0, magneting:!1};
Entry.BoxModel = function() {
  Entry.Model(this);
};
Entry.BoxModel.prototype.schema = {id:0, type:Entry.STATIC.BOX_MODEL, x:0, y:0, width:0, height:0};
Entry.DragInstance = function(a) {
  Entry.Model(this);
  this.set(a);
};
Entry.DragInstance.prototype.schema = {type:Entry.STATIC.DRAG_INSTANCE, startX:0, startY:0, offsetX:0, offsetY:0, absX:0, absY:0, prev:null, height:0, mode:0, isNew:!1};
Entry.ThreadModel = function() {
  Entry.Model(this);
};
Entry.ThreadModel.prototype.schema = {id:0, type:Entry.STATIC.THREAD_MODEL, x:0, y:0, width:0, minWidth:0, height:0};
Entry.EntryObject = function(a) {
  if (a) {
    this.id = a.id;
    this.name = a.name || a.sprite.name;
    this.text = a.text || this.name;
    this.objectType = a.objectType;
    this.objectType || (this.objectType = "sprite");
    this.script = new Entry.Code(a.script ? a.script : [], this);
    this.pictures = a.sprite.pictures;
    this.sounds = [];
    this.sounds = a.sprite.sounds;
    for (var b = 0;b < this.sounds.length;b++) {
      this.sounds[b].id || (this.sounds[b].id = Entry.generateHash()), Entry.initSound(this.sounds[b]);
    }
    this.lock = a.lock ? a.lock : !1;
    this.isEditing = !1;
    "sprite" == this.objectType && (this.selectedPicture = a.selectedPictureId ? this.getPicture(a.selectedPictureId) : this.pictures[0]);
    this.scene = Entry.scene.getSceneById(a.scene) || Entry.scene.selectedScene;
    this.setRotateMethod(a.rotateMethod);
    this.entity = new Entry.EntityObject(this);
    this.entity.injectModel(this.selectedPicture ? this.selectedPicture : null, a.entity ? a.entity : this.initEntity(a));
    this.clonedEntities = [];
    Entry.stage.loadObject(this);
    for (b in this.pictures) {
      var d = this.pictures[b];
      d.id || (d.id = Entry.generateHash());
      var c = new Image;
      d.fileurl ? c.src = d.fileurl : d.fileurl ? c.src = d.fileurl : (a = d.filename, c.src = Entry.defaultPath + "/uploads/" + a.substring(0, 2) + "/" + a.substring(2, 4) + "/image/" + a + ".png");
      c.onload = function(b) {
        Entry.container.cachePicture(d.id, c);
      };
    }
  }
};
Entry.EntryObject.prototype.generateView = function() {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("li", this.id);
    a.addClass("entryContainerListElementWorkspace");
    a.object = this;
    a.bindOnClick(function(b) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    });
    Entry.Utils.disableContextmenu(a);
    var b = this;
    $(a).on("contextmenu", function(a) {
      Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function(a) {
        a.stopPropagation();
        a = b;
        a.setLock(!1);
        a.editObjectValues(!0);
        a.nameView_.select();
      }}, {text:Lang.Workspace.context_duplicate, callback:function() {
        Entry.container.addCloneObject(b);
      }}, {text:Lang.Workspace.context_remove, callback:function() {
        Entry.container.removeObject(b);
      }}, {text:Lang.Workspace.copy_file, callback:function() {
        Entry.container.setCopiedObject(b);
      }}, {text:Lang.Blocks.Paste_blocks, callback:function() {
        Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
      }}], "workspace-contextmenu");
    });
    this.view_ = a;
    var d = this, a = Entry.createElement("ul");
    a.addClass("objectInfoView");
    Entry.objectEditable || a.addClass("entryHide");
    var c = Entry.createElement("li");
    c.addClass("objectInfo_visible");
    this.entity.getVisible() || c.addClass("objectInfo_unvisible");
    c.bindOnClick(function(b) {
      Entry.engine.isState("run") || (b = d.entity, b.setVisible(!b.getVisible()) ? this.removeClass("objectInfo_unvisible") : this.addClass("objectInfo_unvisible"));
    });
    var e = Entry.createElement("li");
    e.addClass("objectInfo_unlock");
    this.getLock() && e.addClass("objectInfo_lock");
    e.bindOnClick(function(b) {
      Entry.engine.isState("run") || (b = d, b.setLock(!b.getLock()) ? this.addClass("objectInfo_lock") : this.removeClass("objectInfo_lock"), b.updateInputViews(b.getLock()));
    });
    a.appendChild(c);
    a.appendChild(e);
    this.view_.appendChild(a);
    a = Entry.createElement("div");
    a.addClass("entryObjectThumbnailWorkspace");
    this.view_.appendChild(a);
    this.thumbnailView_ = a;
    a = Entry.createElement("div");
    a.addClass("entryObjectWrapperWorkspace");
    this.view_.appendChild(a);
    c = Entry.createElement("input");
    c.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    c.addClass("entryObjectNameWorkspace");
    a.appendChild(c);
    this.nameView_ = c;
    this.nameView_.entryObject = this;
    c.setAttribute("readonly", !0);
    var f = this;
    this.nameView_.onblur = function(b) {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    };
    this.nameView_.onkeypress = function(b) {
      13 == b.keyCode && f.editObjectValues(!1);
    };
    this.nameView_.value = this.name;
    c = Entry.createElement("div");
    c.addClass("entryObjectEditWorkspace");
    c.object = this;
    this.editView_ = c;
    this.view_.appendChild(c);
    Entry.objectEditable ? ($(c).mousedown(function(a) {
      var d = b.isEditing;
      a.stopPropagation();
      Entry.documentMousedown.notify(a);
      Entry.engine.isState("run") || !1 !== d || (b.editObjectValues(!d), Entry.playground.object !== b && Entry.container.selectObject(b.id), b.nameView_.select());
    }), c.blur = function(a) {
      b.editObjectComplete();
    }) : c.addClass("entryRemove");
    Entry.objectEditable && Entry.objectDeletable && (c = Entry.createElement("div"), c.addClass("entryObjectDeleteWorkspace"), c.object = this, this.deleteView_ = c, this.view_.appendChild(c), c.bindOnClick(function(b) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    }));
    c = Entry.createElement("div");
    c.addClass("entryObjectInformationWorkspace");
    c.object = this;
    this.isInformationToggle = !1;
    a.appendChild(c);
    this.informationView_ = c;
    a = Entry.createElement("div");
    a.addClass("entryObjectRotationWrapperWorkspace");
    a.object = this;
    this.view_.appendChild(a);
    c = Entry.createElement("span");
    c.addClass("entryObjectCoordinateWorkspace");
    a.appendChild(c);
    e = Entry.createElement("span");
    e.addClass("entryObjectCoordinateSpanWorkspace");
    e.innerHTML = "X:";
    var g = Entry.createElement("input");
    g.addClass("entryObjectCoordinateInputWorkspace");
    g.setAttribute("readonly", !0);
    g.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    var h = Entry.createElement("span");
    h.addClass("entryObjectCoordinateSpanWorkspace");
    h.innerHTML = "Y:";
    var k = Entry.createElement("input");
    k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right");
    k.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    k.setAttribute("readonly", !0);
    var l = Entry.createElement("span");
    l.addClass("entryObjectCoordinateSizeWorkspace");
    l.innerHTML = Lang.Workspace.Size + " : ";
    var m = Entry.createElement("input");
    m.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size");
    m.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    m.setAttribute("readonly", !0);
    c.appendChild(e);
    c.appendChild(g);
    c.appendChild(h);
    c.appendChild(k);
    c.appendChild(l);
    c.appendChild(m);
    c.xInput_ = g;
    c.yInput_ = k;
    c.sizeInput_ = m;
    this.coordinateView_ = c;
    d = this;
    g.onkeypress = function(b) {
      13 == b.keyCode && d.editObjectValues(!1);
    };
    g.onblur = function(b) {
      isNaN(g.value) || d.entity.setX(Number(g.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    k.onkeypress = function(b) {
      13 == b.keyCode && d.editObjectValues(!1);
    };
    k.onblur = function(b) {
      isNaN(k.value) || d.entity.setY(Number(k.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    m.onkeypress = function(b) {
      13 == b.keyCode && d.editObjectValues(!1);
    };
    m.onblur = function(b) {
      isNaN(m.value) || d.entity.setSize(Number(m.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    c = Entry.createElement("div");
    c.addClass("entryObjectRotateLabelWrapperWorkspace");
    this.view_.appendChild(c);
    this.rotateLabelWrapperView_ = c;
    e = Entry.createElement("span");
    e.addClass("entryObjectRotateSpanWorkspace");
    e.innerHTML = Lang.Workspace.rotation + " : ";
    var n = Entry.createElement("input");
    n.addClass("entryObjectRotateInputWorkspace");
    n.setAttribute("readonly", !0);
    n.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    this.rotateSpan_ = e;
    this.rotateInput_ = n;
    h = Entry.createElement("span");
    h.addClass("entryObjectDirectionSpanWorkspace");
    h.innerHTML = Lang.Workspace.direction + " : ";
    var q = Entry.createElement("input");
    q.addClass("entryObjectDirectionInputWorkspace");
    q.setAttribute("readonly", !0);
    q.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    this.directionInput_ = q;
    c.appendChild(e);
    c.appendChild(n);
    c.appendChild(h);
    c.appendChild(q);
    c.rotateInput_ = n;
    c.directionInput_ = q;
    d = this;
    n.onkeypress = function(b) {
      13 == b.keyCode && d.editObjectValues(!1);
    };
    n.onblur = function(b) {
      b = n.value;
      -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da")));
      isNaN(b) || d.entity.setRotation(Number(b));
      d.updateRotationView();
      Entry.stage.updateObject();
    };
    q.onkeypress = function(b) {
      13 == b.keyCode && d.editObjectValues(!1);
    };
    q.onblur = function(b) {
      b = q.value;
      -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da")));
      isNaN(b) || d.entity.setDirection(Number(b));
      d.updateRotationView();
      Entry.stage.updateObject();
    };
    c = Entry.createElement("div");
    c.addClass("rotationMethodWrapper");
    a.appendChild(c);
    this.rotationMethodWrapper_ = c;
    a = Entry.createElement("span");
    a.addClass("entryObjectRotateMethodLabelWorkspace");
    c.appendChild(a);
    a.innerHTML = Lang.Workspace.rotate_method + " : ";
    a = Entry.createElement("div");
    a.addClass("entryObjectRotateModeWorkspace");
    a.addClass("entryObjectRotateModeAWorkspace");
    a.object = this;
    this.rotateModeAView_ = a;
    c.appendChild(a);
    a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("free"), this.object.setRotateMethod("free"));
    });
    a = Entry.createElement("div");
    a.addClass("entryObjectRotateModeWorkspace");
    a.addClass("entryObjectRotateModeBWorkspace");
    a.object = this;
    this.rotateModeBView_ = a;
    c.appendChild(a);
    a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("vertical"), this.object.setRotateMethod("vertical"));
    });
    a = Entry.createElement("div");
    a.addClass("entryObjectRotateModeWorkspace");
    a.addClass("entryObjectRotateModeCWorkspace");
    a.object = this;
    this.rotateModeCView_ = a;
    c.appendChild(a);
    a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("none"), this.object.setRotateMethod("none"));
    });
    this.updateThumbnailView();
    this.updateCoordinateView();
    this.updateRotateMethodView();
    this.updateInputViews();
    this.updateCoordinateView(!0);
    this.updateRotationView(!0);
    return this.view_;
  }
  if ("phone" == Entry.type) {
    return a = Entry.createElement("li", this.id), a.addClass("entryContainerListElementWorkspace"), a.object = this, a.bindOnClick(function(b) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    }), $ && (b = this, context.attach("#" + this.id, [{text:Lang.Workspace.context_rename, href:"/", action:function(b) {
      b.preventDefault();
    }}, {text:Lang.Workspace.context_duplicate, href:"/", action:function(a) {
      a.preventDefault();
      Entry.container.addCloneObject(b);
    }}, {text:Lang.Workspace.context_remove, href:"/", action:function(a) {
      a.preventDefault();
      Entry.container.removeObject(b);
    }}])), this.view_ = a, a = Entry.createElement("ul"), a.addClass("objectInfoView"), c = Entry.createElement("li"), c.addClass("objectInfo_visible"), e = Entry.createElement("li"), e.addClass("objectInfo_lock"), a.appendChild(c), a.appendChild(e), this.view_.appendChild(a), a = Entry.createElement("div"), a.addClass("entryObjectThumbnailWorkspace"), this.view_.appendChild(a), this.thumbnailView_ = a, a = Entry.createElement("div"), a.addClass("entryObjectWrapperWorkspace"), this.view_.appendChild(a), 
    c = Entry.createElement("input"), c.addClass("entryObjectNameWorkspace"), a.appendChild(c), this.nameView_ = c, this.nameView_.entryObject = this, this.nameView_.onblur = function() {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    }, this.nameView_.onkeypress = function(b) {
      13 == b.keyCode && d.editObjectValues(!1);
    }, this.nameView_.value = this.name, Entry.objectEditable && Entry.objectDeletable && (c = Entry.createElement("div"), c.addClass("entryObjectDeletePhone"), c.object = this, this.deleteView_ = c, this.view_.appendChild(c), c.bindOnClick(function(b) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    })), c = Entry.createElement("button"), c.addClass("entryObjectEditPhone"), c.object = this, c.bindOnClick(function(b) {
      if (b = Entry.container.getObject(this.id)) {
        Entry.container.selectObject(b.id), Entry.playground.injectObject(b);
      }
    }), this.view_.appendChild(c), c = Entry.createElement("div"), c.addClass("entryObjectInformationWorkspace"), c.object = this, this.isInformationToggle = !1, a.appendChild(c), this.informationView_ = c, c = Entry.createElement("div"), c.addClass("entryObjectRotateLabelWrapperWorkspace"), this.view_.appendChild(c), this.rotateLabelWrapperView_ = c, e = Entry.createElement("span"), e.addClass("entryObjectRotateSpanWorkspace"), e.innerHTML = Lang.Workspace.rotation + " : ", n = Entry.createElement("input"), 
    n.addClass("entryObjectRotateInputWorkspace"), this.rotateSpan_ = e, this.rotateInput_ = n, h = Entry.createElement("span"), h.addClass("entryObjectDirectionSpanWorkspace"), h.innerHTML = Lang.Workspace.direction + " : ", q = Entry.createElement("input"), q.addClass("entryObjectDirectionInputWorkspace"), this.directionInput_ = q, c.appendChild(e), c.appendChild(n), c.appendChild(h), c.appendChild(q), c.rotateInput_ = n, c.directionInput_ = q, d = this, n.onkeypress = function(b) {
      13 == b.keyCode && (b = n.value, -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da"))), isNaN(b) || d.entity.setRotation(Number(b)), d.updateRotationView(), n.blur());
    }, n.onblur = function(b) {
      d.entity.setRotation(d.entity.getRotation());
      Entry.stage.updateObject();
    }, q.onkeypress = function(b) {
      13 == b.keyCode && (b = q.value, -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da"))), isNaN(b) || d.entity.setDirection(Number(b)), d.updateRotationView(), q.blur());
    }, q.onblur = function(b) {
      d.entity.setDirection(d.entity.getDirection());
      Entry.stage.updateObject();
    }, a = Entry.createElement("div"), a.addClass("entryObjectRotationWrapperWorkspace"), a.object = this, this.view_.appendChild(a), c = Entry.createElement("span"), c.addClass("entryObjectCoordinateWorkspace"), a.appendChild(c), e = Entry.createElement("span"), e.addClass("entryObjectCoordinateSpanWorkspace"), e.innerHTML = "X:", g = Entry.createElement("input"), g.addClass("entryObjectCoordinateInputWorkspace"), h = Entry.createElement("span"), h.addClass("entryObjectCoordinateSpanWorkspace"), 
    h.innerHTML = "Y:", k = Entry.createElement("input"), k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right"), l = Entry.createElement("span"), l.addClass("entryObjectCoordinateSpanWorkspace"), l.innerHTML = Lang.Workspace.Size, m = Entry.createElement("input"), m.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size"), c.appendChild(e), c.appendChild(g), c.appendChild(h), c.appendChild(k), c.appendChild(l), c.appendChild(m), 
    c.xInput_ = g, c.yInput_ = k, c.sizeInput_ = m, this.coordinateView_ = c, d = this, g.onkeypress = function(b) {
      13 == b.keyCode && (isNaN(g.value) || d.entity.setX(Number(g.value)), d.updateCoordinateView(), d.blur());
    }, g.onblur = function(b) {
      d.entity.setX(d.entity.getX());
      Entry.stage.updateObject();
    }, k.onkeypress = function(b) {
      13 == b.keyCode && (isNaN(k.value) || d.entity.setY(Number(k.value)), d.updateCoordinateView(), d.blur());
    }, k.onblur = function(b) {
      d.entity.setY(d.entity.getY());
      Entry.stage.updateObject();
    }, c = Entry.createElement("div"), c.addClass("rotationMethodWrapper"), a.appendChild(c), this.rotationMethodWrapper_ = c, a = Entry.createElement("span"), a.addClass("entryObjectRotateMethodLabelWorkspace"), c.appendChild(a), a.innerHTML = Lang.Workspace.rotate_method + " : ", a = Entry.createElement("div"), a.addClass("entryObjectRotateModeWorkspace"), a.addClass("entryObjectRotateModeAWorkspace"), a.object = this, this.rotateModeAView_ = a, c.appendChild(a), a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.setRotateMethod("free");
    }), a = Entry.createElement("div"), a.addClass("entryObjectRotateModeWorkspace"), a.addClass("entryObjectRotateModeBWorkspace"), a.object = this, this.rotateModeBView_ = a, c.appendChild(a), a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.setRotateMethod("vertical");
    }), a = Entry.createElement("div"), a.addClass("entryObjectRotateModeWorkspace"), a.addClass("entryObjectRotateModeCWorkspace"), a.object = this, this.rotateModeCView_ = a, c.appendChild(a), a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.setRotateMethod("none");
    }), this.updateThumbnailView(), this.updateCoordinateView(), this.updateRotateMethodView(), this.updateInputViews(), this.view_;
  }
};
Entry.EntryObject.prototype.setName = function(a) {
  Entry.assert("string" == typeof a, "object name must be string");
  this.name = a;
  this.nameView_.value = a;
};
Entry.EntryObject.prototype.setText = function(a) {
  Entry.assert("string" == typeof a, "object text must be string");
  this.text = a;
};
Entry.EntryObject.prototype.setScript = function(a) {
  this.script = a;
};
Entry.EntryObject.prototype.getScriptText = function() {
  return JSON.stringify(this.script.toJSON());
};
Entry.EntryObject.prototype.initEntity = function(a) {
  var b = {};
  b.x = b.y = 0;
  b.rotation = 0;
  b.direction = 90;
  if ("sprite" == this.objectType) {
    var d = a.sprite.pictures[0].dimension;
    b.regX = d.width / 2;
    b.regY = d.height / 2;
    b.scaleX = b.scaleY = "background" == a.sprite.category.main ? Math.max(270 / d.height, 480 / d.width) : "new" == a.sprite.category.main ? 1 : 200 / (d.width + d.height);
    b.width = d.width;
    b.height = d.height;
  } else {
    if ("textBox" == this.objectType) {
      if (b.regX = 25, b.regY = 12, b.scaleX = b.scaleY = 1.5, b.width = 50, b.height = 24, b.text = a.text, a.options) {
        if (a = a.options, d = "", a.bold && (d += "bold "), a.italic && (d += "italic "), b.underline = a.underline, b.strike = a.strike, b.font = d + "20px " + a.font.family, b.colour = a.colour, b.bgColor = a.background, b.lineBreak = a.lineBreak) {
          b.width = 256, b.height = .5625 * b.width, b.regX = b.width / 2, b.regY = b.height / 2;
        }
      } else {
        b.underline = !1, b.strike = !1, b.font = "20px Nanum Gothic", b.colour = "#000000", b.bgColor = "#ffffff";
      }
    }
  }
  return b;
};
Entry.EntryObject.prototype.updateThumbnailView = function() {
  if ("sprite" == this.objectType) {
    if (this.entity.picture.fileurl) {
      this.thumbnailView_.style.backgroundImage = 'url("' + this.entity.picture.fileurl + '")';
    } else {
      var a = this.entity.picture.filename;
      this.thumbnailView_.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + a.substring(0, 2) + "/" + a.substring(2, 4) + "/thumb/" + a + '.png")';
    }
  } else {
    "textBox" == this.objectType && (this.thumbnailView_.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/text_icon.png") + ")");
  }
};
Entry.EntryObject.prototype.updateCoordinateView = function(a) {
  if ((this.isSelected() || a) && this.coordinateView_ && this.coordinateView_.xInput_ && this.coordinateView_.yInput_) {
    a = this.coordinateView_.xInput_.value;
    var b = this.coordinateView_.yInput_.value, d = this.coordinateView_.sizeInput_.value, c = this.entity.getX().toFixed(1), e = this.entity.getY().toFixed(1), f = this.entity.getSize().toFixed(1);
    a != c && (this.coordinateView_.xInput_.value = c);
    b != e && (this.coordinateView_.yInput_.value = e);
    d != f && (this.coordinateView_.sizeInput_.value = f);
  }
};
Entry.EntryObject.prototype.updateRotationView = function(a) {
  if (this.isSelected() && this.view_ || a) {
    a = "", "free" == this.getRotateMethod() ? (this.rotateSpan_.removeClass("entryRemove"), this.rotateInput_.removeClass("entryRemove"), a += this.entity.getRotation().toFixed(1), this.rotateInput_.value = a + "\u02da") : (this.rotateSpan_.addClass("entryRemove"), this.rotateInput_.addClass("entryRemove")), a = "" + this.entity.getDirection().toFixed(1), this.directionInput_.value = a + "\u02da";
  }
};
Entry.EntryObject.prototype.select = function(a) {
  console.log(this);
};
Entry.EntryObject.prototype.addPicture = function(a, b) {
  Entry.stateManager && Entry.stateManager.addCommand("add sprite", this, this.removePicture, a.id);
  b || 0 === b ? (this.pictures.splice(b, 0, a), Entry.playground.injectPicture(this)) : this.pictures.push(a);
  return new Entry.State(this, this.removePicture, a.id);
};
Entry.EntryObject.prototype.removePicture = function(a) {
  if (2 > this.pictures.length) {
    return !1;
  }
  a = this.getPicture(a);
  var b = this.pictures.indexOf(a);
  Entry.stateManager && Entry.stateManager.addCommand("remove sprite", this, this.addPicture, a, b);
  this.pictures.splice(b, 1);
  a === this.selectedPicture && Entry.playground.selectPicture(this.pictures[0]);
  Entry.playground.injectPicture(this);
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addPicture, a, b);
};
Entry.EntryObject.prototype.getPicture = function(a) {
  if (!a) {
    return this.selectedPicture;
  }
  a = a.trim();
  for (var b = this.pictures, d = b.length, c = 0;c < d;c++) {
    if (b[c].id == a) {
      return b[c];
    }
  }
  for (c = 0;c < d;c++) {
    if (b[c].name == a) {
      return b[c];
    }
  }
  a = Entry.parseNumber(a);
  if ((!1 !== a || "boolean" != typeof a) && d >= a && 0 < a) {
    return b[a - 1];
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.setPicture = function(a) {
  for (var b in this.pictures) {
    if (a.id === this.pictures[b].id) {
      this.pictures[b] = a;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.getPrevPicture = function(a) {
  for (var b = this.pictures, d = b.length, c = 0;c < d;c++) {
    if (b[c].id == a) {
      return b[0 == c ? d - 1 : c - 1];
    }
  }
};
Entry.EntryObject.prototype.getNextPicture = function(a) {
  for (var b = this.pictures, d = b.length, c = 0;c < d;c++) {
    if (b[c].id == a) {
      return b[c == d - 1 ? 0 : c + 1];
    }
  }
};
Entry.EntryObject.prototype.selectPicture = function(a) {
  var b = this.getPicture(a);
  if (b) {
    this.selectedPicture = b, this.entity.setImage(b), this.updateThumbnailView();
  } else {
    throw Error("No picture with pictureId : " + a);
  }
};
Entry.EntryObject.prototype.addSound = function(a, b) {
  a.id || (a.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add sound", this, this.removeSound, a.id);
  Entry.initSound(a, b);
  b || 0 === b ? (this.sounds.splice(b, 0, a), Entry.playground.injectSound(this)) : this.sounds.push(a);
  return new Entry.State(this, this.removeSound, a.id);
};
Entry.EntryObject.prototype.removeSound = function(a) {
  var b;
  b = this.getSound(a);
  a = this.sounds.indexOf(b);
  Entry.stateManager && Entry.stateManager.addCommand("remove sound", this, this.addSound, b, a);
  this.sounds.splice(a, 1);
  Entry.playground.reloadPlayground();
  Entry.playground.injectSound(this);
  return new Entry.State(this, this.addSound, b, a);
};
Entry.EntryObject.prototype.getRotateMethod = function() {
  this.rotateMethod || (this.rotateMethod = "free");
  return this.rotateMethod;
};
Entry.EntryObject.prototype.setRotateMethod = function(a) {
  a || (a = "free");
  this.rotateMethod = a;
  this.updateRotateMethodView();
  Entry.stage.selectedObject && Entry.stage.selectedObject.entity && (Entry.stage.updateObject(), Entry.stage.updateHandle());
};
Entry.EntryObject.prototype.initRotateValue = function(a) {
  this.rotateMethod != a && (this.entity.rotation = 0, this.entity.direction = 90);
};
Entry.EntryObject.prototype.updateRotateMethodView = function() {
  var a = this.rotateMethod;
  this.rotateModeAView_ && (this.rotateModeAView_.removeClass("selected"), this.rotateModeBView_.removeClass("selected"), this.rotateModeCView_.removeClass("selected"), "free" == a ? this.rotateModeAView_.addClass("selected") : "vertical" == a ? this.rotateModeBView_.addClass("selected") : this.rotateModeCView_.addClass("selected"), this.updateRotationView());
};
Entry.EntryObject.prototype.toggleInformation = function(a) {
  this.setRotateMethod(this.getRotateMethod());
  void 0 === a && (a = this.isInformationToggle = !this.isInformationToggle);
  a ? this.view_.addClass("informationToggle") : this.view_.removeClass("informationToggle");
};
Entry.EntryObject.prototype.addCloneEntity = function(a, b, d) {
  this.clonedEntities.length > Entry.maxCloneLimit || (a = new Entry.EntityObject(this), b ? (a.injectModel(b.picture ? b.picture : null, b.toJSON()), a.snapshot_ = b.snapshot_, b.effect && (a.effect = Entry.cloneSimpleObject(b.effect), a.applyFilter()), b.brush && Entry.setCloneBrush(a, b.brush)) : (a.injectModel(this.entity.picture ? this.entity.picture : null, this.entity.toJSON(a)), a.snapshot_ = this.entity.snapshot_, this.entity.effect && (a.effect = Entry.cloneSimpleObject(this.entity.effect), 
  a.applyFilter()), this.entity.brush && Entry.setCloneBrush(a, this.entity.brush)), Entry.engine.raiseEventOnEntity(a, [a, "when_clone_start"]), a.isClone = !0, a.isStarted = !0, this.addCloneVariables(this, a, b ? b.variables : null, b ? b.lists : null), this.clonedEntities.push(a), Entry.stage.loadEntity(a));
};
Entry.EntryObject.prototype.initializeSplitter = function(a) {
  a.onmousedown = function(b) {
    Entry.container.disableSort();
    Entry.container.splitterEnable = !0;
  };
  document.addEventListener("mousemove", function(b) {
    Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:b.x || b.clientX});
  });
  document.addEventListener("mouseup", function(b) {
    Entry.container.splitterEnable = !1;
    Entry.container.enableSort();
  });
};
Entry.EntryObject.prototype.isSelected = function() {
  return this.isSelected_;
};
Entry.EntryObject.prototype.toJSON = function() {
  var a = {};
  a.id = this.id;
  a.name = this.name;
  "textBox" == this.objectType && (a.text = this.text);
  a.script = this.getScriptText();
  "sprite" == this.objectType && (a.selectedPictureId = this.selectedPicture.id);
  a.objectType = this.objectType;
  a.rotateMethod = this.getRotateMethod();
  a.scene = this.scene.id;
  a.sprite = {pictures:Entry.getPicturesJSON(this.pictures), sounds:Entry.getSoundsJSON(this.sounds)};
  a.lock = this.lock;
  a.entity = this.entity.toJSON();
  return a;
};
Entry.EntryObject.prototype.destroy = function() {
  Entry.stage.unloadEntity(this.entity);
  this.view_ && Entry.removeElement(this.view_);
};
Entry.EntryObject.prototype.getSound = function(a) {
  a = a.trim();
  for (var b = this.sounds, d = b.length, c = 0;c < d;c++) {
    if (b[c].id == a) {
      return b[c];
    }
  }
  for (c = 0;c < d;c++) {
    if (b[c].name == a) {
      return b[c];
    }
  }
  a = Entry.parseNumber(a);
  if ((!1 !== a || "boolean" != typeof a) && d >= a && 0 < a) {
    return b[a - 1];
  }
  throw Error("No Sound");
};
Entry.EntryObject.prototype.addCloneVariables = function(a, b, d, c) {
  b.variables = [];
  b.lists = [];
  d || (d = Entry.findObjsByKey(Entry.variableContainer.variables_, "object_", a.id));
  c || (c = Entry.findObjsByKey(Entry.variableContainer.lists_, "object_", a.id));
  for (a = 0;a < d.length;a++) {
    b.variables.push(d[a].clone());
  }
  for (a = 0;a < c.length;a++) {
    b.lists.push(c[a].clone());
  }
};
Entry.EntryObject.prototype.getLock = function() {
  return this.lock;
};
Entry.EntryObject.prototype.setLock = function(a) {
  return this.lock = a;
};
Entry.EntryObject.prototype.updateInputViews = function(a) {
  a = a || this.getLock();
  var b = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (a && 1 != b[0].getAttribute("readonly")) {
    for (a = 0;a < b.length;a++) {
      b[a].removeClass("selectedEditingObject"), b[a].setAttribute("readonly", !1), this.isEditing = !1;
    }
  }
};
Entry.EntryObject.prototype.editObjectValues = function(a) {
  var b;
  b = this.getLock() ? [this.nameView_] : [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (a) {
    $(b).removeClass("selectedNotEditingObject");
    for (a = 0;a < b.length;a++) {
      b[a].removeAttribute("readonly"), b[a].addClass("selectedEditingObject");
    }
    this.isEditing = !0;
  } else {
    for (a = 0;a < b.length;a++) {
      b[a].blur(!0);
    }
    this.blurAllInput();
    this.isEditing = !1;
  }
};
Entry.EntryObject.prototype.blurAllInput = function() {
  var a = document.getElementsByClassName("selectedEditingObject");
  $(a).removeClass("selectedEditingObject");
  for (var a = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_], b = 0;b < a.length;b++) {
    a[b].addClass("selectedNotEditingObject"), a[b].setAttribute("readonly", !0);
  }
};
Entry.EntryObject.prototype.addStampEntity = function(a) {
  a = new Entry.StampEntity(this, a);
  Entry.stage.loadEntity(a);
  this.clonedEntities.push(a);
  Entry.stage.sortZorder();
};
Entry.EntryObject.prototype.getClonedEntities = function() {
  var a = [];
  this.clonedEntities.map(function(b) {
    b.isStamp || a.push(b);
  });
  return a;
};
Entry.EntryObject.prototype.getStampEntities = function() {
  var a = [];
  this.clonedEntities.map(function(b) {
    b.isStamp && a.push(b);
  });
  return a;
};
Entry.EntryObject.prototype.clearExecutor = function() {
  this.script.clearExecutors();
};
Entry.Painter = function() {
  this.toolbox = {selected:"cursor"};
  this.stroke = {enabled:!1, fillColor:"#000000", lineColor:"#000000", thickness:1, fill:!0, transparent:!1, style:"line", locked:!1};
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  this.font = {name:"KoPub Batang", size:20, style:"normal"};
  this.selectArea = {};
  this.firstStatement = !1;
};
Entry.Painter.prototype.initialize = function(a) {
  this.generateView(a);
  this.canvas = document.getElementById("entryPainterCanvas");
  this.canvas_ = document.getElementById("entryPainterCanvas_");
  this.stage = new createjs.Stage(this.canvas);
  this.stage.autoClear = !0;
  this.stage.enableDOMEvents(!0);
  this.stage.enableMouseOver(10);
  this.stage.mouseMoveOutside = !0;
  createjs.Touch.enable(this.stage);
  this.objectContainer = new createjs.Container;
  this.objectContainer.name = "container";
  this.stage.addChild(this.objectContainer);
  this.ctx = this.stage.canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled = !1;
  this.ctx.webkitImageSmoothingEnabled = !1;
  this.ctx.mozImageSmoothingEnabled = !1;
  this.ctx.msImageSmoothingEnabled = !1;
  this.ctx.oImageSmoothingEnabled = !1;
  this.ctx_ = this.canvas_.getContext("2d");
  this.initDashedLine();
  this.initPicture();
  this.initCoordinator();
  this.initHandle();
  this.initDraw();
  var b = this;
  Entry.addEventListener("textUpdate", function() {
    var a = b.inputField.value();
    "" === a ? (b.inputField.hide(), delete b.inputField) : (b.inputField.hide(), b.drawText(a), b.selectToolbox("cursor"));
  });
  this.selectToolbox("cursor");
};
Entry.Painter.prototype.initHandle = function() {
  this._handle = new createjs.Container;
  this._handle.rect = new createjs.Shape;
  this._handle.addChild(this._handle.rect);
  var a = new createjs.Container;
  a.name = "move";
  a.width = 90;
  a.height = 90;
  a.x = 90;
  a.y = 90;
  a.rect = new createjs.Shape;
  var b = this;
  a.rect.on("mousedown", function(d) {
    "cursor" === b.toolbox.selected && (b.initCommand(), this.offset = {x:this.parent.x - this.x - d.stageX, y:this.parent.y - this.y - d.stageY}, this.parent.handleMode = "move", a.isSelectCenter = !1);
  });
  a.rect.on("pressmove", function(d) {
    "cursor" !== b.toolbox.selected || a.isSelectCenter || (b.doCommand(), this.parent.x = d.stageX + this.offset.x, this.parent.y = d.stageY + this.offset.y, b.updateImageHandle());
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  a.rect.cursor = "move";
  a.addChild(a.rect);
  a.notch = new createjs.Shape;
  a.addChild(a.notch);
  a.NEHandle = this.generateCornerHandle();
  a.addChild(a.NEHandle);
  a.NWHandle = this.generateCornerHandle();
  a.addChild(a.NWHandle);
  a.SWHandle = this.generateCornerHandle();
  a.addChild(a.SWHandle);
  a.SEHandle = this.generateCornerHandle();
  a.addChild(a.SEHandle);
  a.EHandle = this.generateXHandle();
  a.addChild(a.EHandle);
  a.WHandle = this.generateXHandle();
  a.addChild(a.WHandle);
  a.NHandle = this.generateYHandle();
  a.addChild(a.NHandle);
  a.SHandle = this.generateYHandle();
  a.addChild(a.SHandle);
  a.RHandle = new createjs.Shape;
  a.RHandle.graphics.ss(2, 2, 0).beginFill("#888").s("#c1c7cd").f("#c1c7cd").dr(-2, -2, 8, 8);
  a.RHandle.on("mousedown", function(a) {
    b.initCommand();
  });
  a.RHandle.on("pressmove", function(a) {
    b.doCommand();
    var c = a.stageX - this.parent.x;
    a = a.stageY - this.parent.y;
    this.parent.rotation = 0 <= c ? Math.atan(a / c) / Math.PI * 180 + 90 : Math.atan(a / c) / Math.PI * 180 + 270;
    b.updateImageHandle();
  });
  a.RHandle.cursor = "crosshair";
  a.addChild(a.RHandle);
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  a.visible = !1;
  this.handle = a;
  this.stage.addChild(a);
  this.updateImageHandleCursor();
};
Entry.Painter.prototype.generateCornerHandle = function() {
  var a = this, b = new createjs.Shape;
  b.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  b.on("mousedown", function(b) {
    a.initCommand();
    this.offset = {x:b.stageX - this.parent.x + this.parent.regX, y:b.stageY - this.parent.y + this.parent.regY};
  });
  b.on("pressmove", function(b) {
    a.doCommand();
    var c = Math.sqrt(Math.abs((b.stageX - this.parent.x + this.parent.regX) / this.offset.x * (b.stageY - this.parent.y + this.parent.regY) / this.offset.y));
    10 < this.parent.width * c && 10 < this.parent.height * c && (this.parent.width *= c, this.parent.height *= c, this.offset = {x:b.stageX - this.parent.x + this.parent.regX, y:b.stageY - this.parent.y + this.parent.regY});
    a.updateImageHandle();
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  return b;
};
Entry.Painter.prototype.generateXHandle = function() {
  var a = this, b = new createjs.Shape;
  b.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  b.on("mousedown", function(b) {
    a.initCommand();
    this.offset = {x:b.stageX - this.parent.x + this.parent.regX};
  });
  b.on("pressmove", function(b) {
    a.doCommand();
    var c = Math.abs((b.stageX - this.parent.x + this.parent.regX) / this.offset.x);
    10 < this.parent.width * c && (this.parent.width *= c, this.offset = {x:b.stageX - this.parent.x + this.parent.regX});
    a.updateImageHandle();
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  return b;
};
Entry.Painter.prototype.generateYHandle = function() {
  var a = this, b = new createjs.Shape;
  b.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  b.on("mousedown", function(b) {
    a.initCommand();
    this.offset = {y:b.stageY - this.parent.y + this.parent.regY};
  });
  b.on("pressmove", function(b) {
    a.doCommand();
    var c = Math.abs((b.stageY - this.parent.y + this.parent.regY) / this.offset.y);
    10 < this.parent.height * c && (this.parent.height *= c, this.offset = {y:b.stageY - this.parent.y + this.parent.regY});
    a.updateImageHandle();
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  return b;
};
Entry.Painter.prototype.updateImageHandle = function() {
  if (this.handle.visible) {
    var a = this.handle, b = a.direction, d = a.width, c = a.height, e = a.regX, f = a.regY;
    a.rect.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(-d / 2, -c / 2).lt(0, -c / 2).lt(0, -c / 2).lt(+d / 2, -c / 2).lt(+d / 2, +c / 2).lt(-d / 2, +c / 2).cp();
    a.notch.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(0, -c / 2).lt(0, -c / 2 - 20).cp();
    a.NEHandle.x = +a.width / 2;
    a.NEHandle.y = -a.height / 2;
    a.NWHandle.x = -a.width / 2;
    a.NWHandle.y = -a.height / 2;
    a.SWHandle.x = -a.width / 2;
    a.SWHandle.y = +a.height / 2;
    a.SEHandle.x = +a.width / 2;
    a.SEHandle.y = +a.height / 2;
    a.EHandle.x = +a.width / 2;
    a.EHandle.y = 0;
    a.WHandle.x = -a.width / 2;
    a.WHandle.y = 0;
    a.NHandle.x = 0;
    a.NHandle.y = -a.height / 2;
    a.SHandle.x = 0;
    a.SHandle.y = +a.height / 2;
    a.RHandle.x = -2;
    a.RHandle.y = -a.height / 2 - 20 - 2;
    this.handle.visible && (d = this.selectedObject, this.selectedObject.text ? (d.width = this.selectedObject.width, d.height = this.selectedObject.height) : (d.width = d.image.width, d.height = d.image.height), d.scaleX = a.width / d.width, d.scaleY = a.height / d.height, d.x = a.x, d.y = a.y, d.regX = d.width / 2 + e / d.scaleX, d.regY = d.height / 2 + f / d.scaleY, d.rotation = a.rotation, d.direction = b, this.selectArea.x1 = a.x - a.width / 2, this.selectArea.y1 = a.y - a.height / 2, this.selectArea.x2 = 
    a.width, this.selectArea.y2 = a.height, this.objectWidthInput.value = Math.abs(d.width * d.scaleX).toFixed(0), this.objectHeightInput.value = Math.abs(d.height * d.scaleY).toFixed(0), this.objectRotateInput.value = (1 * d.rotation).toFixed(0));
    this.updateImageHandleCursor();
    this.stage.update();
  }
};
Entry.Painter.prototype.updateImageHandleCursor = function() {
  var a = this.handle;
  a.rect.cursor = "move";
  a.RHandle.cursor = "crosshair";
  for (var b = ["nwse-resize", "ns-resize", "nesw-resize", "ew-resize"], d = Math.floor((a.rotation + 22.5) % 180 / 45), c = 0;c < d;c++) {
    b.push(b.shift());
  }
  a.NHandle.cursor = b[1];
  a.NEHandle.cursor = b[2];
  a.EHandle.cursor = b[3];
  a.SEHandle.cursor = b[0];
  a.SHandle.cursor = b[1];
  a.SWHandle.cursor = b[2];
  a.WHandle.cursor = b[3];
  a.NWHandle.cursor = b[0];
};
Entry.Painter.prototype.clearCanvas = function(a) {
  this.clearHandle();
  a || this.initCommand();
  this.objectContainer.removeAllChildren();
  this.stage.update();
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  a = 0;
  for (var b = this.colorLayerData.data.length;a < b;a++) {
    this.colorLayerData.data[a] = 255, this.colorLayerData.data[a + 1] = 255, this.colorLayerData.data[a + 2] = 255, this.colorLayerData.data[a + 3] = 255;
  }
  this.reloadContext();
};
Entry.Painter.prototype.newPicture = function() {
  var a = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
  a.id = Entry.generateHash();
  Entry.playground.addPicture(a, !0);
};
Entry.Painter.prototype.initPicture = function() {
  var a = this;
  Entry.addEventListener("pictureSelected", function(b) {
    a.selectToolbox("cursor");
    if (a.file.id !== b.id) {
      a.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && (a.file_ = JSON.parse(JSON.stringify(a.file)), a.file_save(!0));
      a.file.modified = !1;
      a.clearCanvas(!0);
      var d = new Image;
      d.id = b.id ? b.id : Entry.generateHash();
      a.file.id = d.id;
      a.file.name = b.name;
      a.file.mode = "edit";
      d.src = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/image/" + b.filename + ".png";
      d.onload = function(b) {
        a.addImage(b.target);
      };
    }
  });
  Entry.addEventListener("pictureImport", function(b) {
    a.addPicture(b);
  });
  Entry.addEventListener("pictureNameChanged", function(b) {
    a.file.name = b.name;
  });
  Entry.addEventListener("pictureClear", function(b) {
    a.file.modified = !1;
    a.file.id = "";
    a.file.name = "";
    a.clearCanvas();
  });
};
Entry.Painter.prototype.initDraw = function() {
  var a = this;
  this.stage.on("stagemousedown", function(b) {
    a.stagemousedown(b);
  });
  this.stage.on("stagemouseup", function(b) {
    a.stagemouseup(b);
  });
  this.stage.on("stagemousemove", function(b) {
    a.stagemousemove(b);
  });
};
Entry.Painter.prototype.selectObject = function(a, b) {
  this.selectedObject = a;
  this.handle.visible = a.visible;
  b ? (this.handle.width = this.copy.width, this.handle.height = this.copy.height, this.handle.x = this.selectArea.x1 + this.copy.width / 2, this.handle.y = this.selectArea.y1 + this.copy.height / 2) : (this.handle.width = a.scaleX * a.image.width, this.handle.height = a.scaleY * a.image.height, this.handle.x = a.x, this.handle.y = a.y, this.handle.regX = +(a.regX - a.image.width / 2) * a.scaleX, this.handle.regY = +(a.regY - a.image.height / 2) * a.scaleY);
  this.handle.rotation = a.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.selectTextObject = function(a) {
  this.selectedObject = a;
  var b = a.getTransformedBounds();
  this.handle.visible = a.visible;
  a.width || (this.selectedObject.width = b.width);
  a.height || (this.selectedObject.height = b.height);
  this.handle.width = a.scaleX * this.selectedObject.width;
  this.handle.height = a.scaleY * this.selectedObject.height;
  this.handle.x = a.x;
  this.handle.y = a.y;
  a.regX || (a.regX = a.width / 2);
  a.regY || (a.regY = a.height / 2);
  this.handle.regX = (a.regX - this.selectedObject.width / 2) * a.scaleX;
  this.handle.regY = (a.regY - this.selectedObject.height / 2) * a.scaleY;
  this.handle.rotation = a.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.updateHandle = function() {
  -1 < this.stage.getChildIndex(this._handle) && this.stage.removeChild(this._handle);
  -1 === this.stage.getChildIndex(this.handle) && this.stage.addChild(this.handle);
  var a = new createjs.Shape;
  a.graphics.clear().beginFill("#000").rect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.handle.rect.hitArea = a;
  this.handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#000000").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 4);
  this.stage.update();
};
Entry.Painter.prototype.updateHandle_ = function() {
  this.stage.getChildIndex(-1 < this._handle) && this.stage.addChild(this._handle);
  this._handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#cccccc").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 2);
  this.stage.update();
};
Entry.Painter.prototype.matchTolerance = function(a, b, d, c, e) {
  var f = this.colorLayerData.data[a], g = this.colorLayerData.data[a + 1];
  a = this.colorLayerData.data[a + 2];
  return f >= b - e / 100 * b && f <= b + e / 100 * b && g >= d - e / 100 * d && g <= d + e / 100 * d && a >= c - e / 100 * c && a <= c + e / 100 * c;
};
Entry.Painter.prototype.matchColorOnly = function(a, b, d, c) {
  return b === this.colorLayerData.data[a] && d === this.colorLayerData.data[a + 1] && c === this.colorLayerData.data[a + 2] ? !0 : !1;
};
Entry.Painter.prototype.matchColor = function(a, b, d, c, e) {
  return b === this.colorLayerData.data[a] && d === this.colorLayerData.data[a + 1] && c === this.colorLayerData.data[a + 2] && e === this.colorLayerData.data[a + 3] ? !0 : !1;
};
Entry.Painter.prototype.colorPixel = function(a, b, d, c, e) {
  e || (e = 255);
  this.stroke.transparent && (e = c = d = b = 0);
  this.colorLayerData.data[a] = b;
  this.colorLayerData.data[a + 1] = d;
  this.colorLayerData.data[a + 2] = c;
  this.colorLayerData.data[a + 3] = e;
};
Entry.Painter.prototype.pickStrokeColor = function(a) {
  a = 4 * (Math.round(a.stageY) * this.canvas.width + Math.round(a.stageX));
  this.stroke.lineColor = Entry.rgb2hex(this.colorLayerData.data[a], this.colorLayerData.data[a + 1], this.colorLayerData.data[a + 2]);
  document.getElementById("entryPainterAttrCircle").style.backgroundColor = this.stroke.lineColor;
  document.getElementById("entryPainterAttrCircleInput").value = this.stroke.lineColor;
};
Entry.Painter.prototype.drawText = function(a) {
  var b = document.getElementById("entryPainterAttrFontStyle").value, d = document.getElementById("entryPainterAttrFontName").value, c = document.getElementById("entryPainterAttrFontSize").value;
  a = new createjs.Text(a, b + " " + c + 'px "' + d + '"', this.stroke.lineColor);
  a.textBaseline = "top";
  a.x = this.oldPt.x;
  a.y = this.oldPt.y;
  this.objectContainer.addChild(a);
  this.selectTextObject(a);
  this.file.modified = !0;
};
Entry.Painter.prototype.addImage = function(a) {
  var b = new createjs.Bitmap(a);
  this.objectContainer.addChild(b);
  b.x = this.stage.canvas.width / 2;
  b.y = this.stage.canvas.height / 2;
  b.regX = b.image.width / 2 | 0;
  b.regY = b.image.height / 2 | 0;
  if (540 < b.image.height) {
    var d = 540 / b.image.height;
    b.scaleX = d;
    b.scaleY = d;
  }
  b.name = a.id;
  b.id = a.id;
  this.selectObject(b);
  this.stage.update();
};
Entry.Painter.prototype.createBrush = function() {
  this.initCommand();
  this.brush = new createjs.Shape;
  this.objectContainer.addChild(this.brush);
  this.stage.update();
};
Entry.Painter.prototype.createEraser = function() {
  this.initCommand();
  this.eraser = new createjs.Shape;
  this.objectContainer.addChild(this.eraser);
  this.stage.update();
};
Entry.Painter.prototype.clearHandle = function() {
  this.handle.visible && (this.handle.visible = !1);
  this.coordinator.visible && (this.coordinator.visible = !1);
  this.stage.update();
};
Entry.Painter.prototype.initCommand = function() {
  var a = !1;
  this.handle.visible && (a = !0, this.handle.visible = !1);
  var b = !1;
  this.coordinator.visible && (b = !0, this.coordinator.visible = !1);
  (a || b) && this.stage.update();
  this.isCommandValid = !1;
  this.colorLayerModel = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  Entry.stateManager && this.firstStatement && Entry.stateManager.addCommand("edit sprite", this, this.restorePainter, this.colorLayerModel);
  this.firstStatement = !0;
  a && (this.handle.visible = !0);
  b && (this.coordinator.visible = !0);
  (a || b) && this.stage.update();
};
Entry.Painter.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.Painter.prototype.checkCommand = function() {
  this.isCommandValid || Entry.dispatchEvent("cancelLastCommand");
};
Entry.Painter.prototype.restorePainter = function(a) {
  this.clearHandle();
  var b = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(a, 0, 0);
  a = new Image;
  a.src = this.canvas.toDataURL();
  var d = this;
  a.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    d.objectContainer.removeAllChildren();
    d.objectContainer.addChild(b);
  };
  Entry.stateManager && Entry.stateManager.addCommand("restore sprite", this, this.restorePainter, b);
};
Entry.Painter.prototype.platten = function() {
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.reloadContext();
};
Entry.Painter.prototype.fill = function() {
  if (!this.stroke.locked) {
    this.stroke.locked = !0;
    this.initCommand();
    this.doCommand();
    this.clearHandle();
    var a = this.canvas.width, b = this.canvas.height;
    this.colorLayerData = this.ctx.getImageData(0, 0, a, b);
    var d = new createjs.Point(this.stage.mouseX, this.stage.mouseY);
    d.x = Math.round(d.x);
    d.y = Math.round(d.y);
    for (var c = 4 * (d.y * a + d.x), e = this.colorLayerData.data[c], f = this.colorLayerData.data[c + 1], g = this.colorLayerData.data[c + 2], h = this.colorLayerData.data[c + 3], k, l, d = [[d.x, d.y]], m = Entry.hex2rgb(this.stroke.lineColor);d.length;) {
      for (var c = d.pop(), n = c[0], q = c[1], c = 4 * (q * a + n);0 <= q && this.matchColor(c, e, f, g, h);) {
        --q, c -= 4 * a;
      }
      c += 4 * a;
      q += 1;
      for (l = k = !1;q < b - 1 && this.matchColor(c, e, f, g, h);) {
        q += 1, this.colorPixel(c, m.r, m.g, m.b), 0 < n && (this.matchColor(c - 4, e, f, g, h) ? k || (d.push([n - 1, q]), k = !0) : k && (k = !1)), n < a - 1 && (this.matchColor(c + 4, e, f, g, h) ? l || (d.push([n + 1, q]), l = !0) : l && (l = !1)), c += 4 * a;
      }
      if (1080 < d.length) {
        break;
      }
    }
    this.file.modified = !0;
    this.reloadContext();
  }
};
Entry.Painter.prototype.reloadContext = function() {
  delete this.selectedObject;
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var a = new Image;
  a.src = this.canvas.toDataURL();
  var b = this;
  a.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    b.objectContainer.removeAllChildren();
    b.objectContainer.addChild(a);
    b.stroke.locked = !1;
  };
};
Entry.Painter.prototype.move_pen = function() {
  var a = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.brush.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke(this.stroke.lineColor).moveTo(a.x, a.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = a.x;
  this.oldMidPt.y = a.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_line = function() {
  this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").moveTo(this.oldPt.x, this.oldPt.y).lineTo(this.stage.mouseX, this.stage.mouseY);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_rect = function() {
  var a = this.stage.mouseX - this.oldPt.x, b = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (b = a);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, a, b) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, a, b) : 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, 
  this.oldPt.y, a, b) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, this.oldPt.y, a, b);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_circle = function() {
  var a = this.stage.mouseX - this.oldPt.x, b = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (b = a);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().beginStroke(this.stroke.fillColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, a, b) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, a, b) : this.stroke.fill || (0 === this.stroke.thickness ? this.brush.graphics.clear().drawEllipse(this.oldPt.x, 
  this.oldPt.y, a, b) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawEllipse(this.oldPt.x, this.oldPt.y, a, b));
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.edit_copy = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0)) : alert("\ubcf5\uc0ac\ud560 \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_cut = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0), this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), this.reloadContext(), this.file.modified = !0) : alert("\uc790\ub97c \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_paste = function() {
  var a = new Image;
  a.src = this.canvas_.toDataURL();
  var b = this;
  a.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    a.x = b.canvas.width / 2;
    a.y = b.canvas.height / 2;
    a.regX = b.copy.width / 2 | 0;
    a.regY = b.copy.height / 2 | 0;
    a.id = Entry.generateHash();
    b.objectContainer.addChild(a);
    b.selectObject(a, !0);
  };
  this.file.modified = !0;
};
Entry.Painter.prototype.edit_select = function() {
  this.clearHandle();
  this.selectedObject && delete this.selectedObject;
  this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.copy = {};
  this.copy.width = this.selectArea.x2;
  this.copy.height = this.selectArea.y2;
  this.canvas_.width = this.copy.width;
  this.canvas_.height = this.copy.height;
  this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.ctx_.putImageData(this.copyLayerData, 0, 0);
  this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var a = new Image;
  a.src = this.canvas.toDataURL();
  var b = this;
  a.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    b.objectContainer.removeAllChildren();
    b.objectContainer.addChild(a);
    a = new Image;
    a.src = b.canvas_.toDataURL();
    a.onload = function(a) {
      a = new createjs.Bitmap(a.target);
      a.x = b.selectArea.x1 + b.copy.width / 2;
      a.y = b.selectArea.y1 + b.copy.height / 2;
      a.regX = b.copy.width / 2 | 0;
      a.regY = b.copy.height / 2 | 0;
      a.id = Entry.generateHash();
      a.name = a.id;
      b.objectContainer.addChild(a);
      b.selectObject(a, !0);
    };
  };
};
Entry.Painter.prototype.move_erase = function(a) {
  a = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.eraser.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke("#ffffff").moveTo(a.x, a.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = a.x;
  this.oldMidPt.y = a.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.settingShapeBlur = function() {
  this.objectWidthInput.blur();
  this.objectHeightInput.blur();
  this.objectRotateInput.blur();
};
Entry.Painter.prototype.stagemousedown = function(a) {
  "picture" == Entry.playground.getViewMode() && (this.settingShapeBlur(), this.oldPt = new createjs.Point(a.stageX, a.stageY), this.oldMidPt = this.oldPt.clone(), "select" === this.toolbox.selected ? this.stage.addChild(this._handle) : "spoid" === this.toolbox.selected ? this.pickStrokeColor(a) : "text" === this.toolbox.selected ? (this.showInputField(a), this.stage.update()) : "erase" === this.toolbox.selected ? (this.createEraser(), this.stroke.enabled = !0) : "fill" === this.toolbox.selected ? 
  this.fill() : "cursor" !== this.toolbox.selected && (this.createBrush(), this.stroke.enabled = !0));
};
Entry.Painter.prototype.stagemousemove = function(a) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected && -1 < this.stage.getChildIndex(this._handle) ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = a.stageX - this.oldPt.x, this.selectArea.y2 = a.stageY - this.oldPt.y, this.updateHandle_()) : this.stroke.enabled && (this.doCommand(), "pen" === this.toolbox.selected ? this.move_pen(a) : "line" === this.toolbox.selected ? this.move_line(a) : "rect" === this.toolbox.selected ? 
  this.move_rect(a) : "circle" === this.toolbox.selected ? this.move_circle(a) : "erase" === this.toolbox.selected && this.move_erase(a)), this.painterTopStageXY.innerHTML = "x:" + a.stageX.toFixed(1) + ", y:" + a.stageY.toFixed(1));
};
Entry.Painter.prototype.stagemouseup = function(a) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = a.stageX - this.oldPt.x, this.selectArea.y2 = a.stageY - this.oldPt.y, this.stage.removeChild(this._handle), this.stage.update(), 0 < this.selectArea.x2 && 0 < this.selectArea.y2 && this.edit_select(), this.selectToolbox("cursor")) : "cursor" !== this.toolbox.selected && this.stroke.enabled && (-1 < this.objectContainer.getChildIndex(this.eraser) && 
  this.eraser.graphics.endStroke(), -1 < this.objectContainer.getChildIndex(this.brush) && this.brush.graphics.endStroke(), this.clearHandle(), this.platten(), this.stroke.enabled = !1, this.checkCommand()));
};
Entry.Painter.prototype.file_save = function(a) {
  this.clearHandle();
  this.transparent();
  this.trim();
  var b = this.canvas_.toDataURL();
  Entry.dispatchEvent("saveCanvasImage", {file:a ? this.file_ : this.file, image:b});
  this.file.modified = !1;
};
Entry.Painter.prototype.transparent = function() {
  var a = this.canvas.width, b = this.canvas.height;
  this.colorLayerData = this.ctx.getImageData(0, 0, a, b);
  var d = a * (b - 1) * 4, c = 4 * (a - 1), e = 4 * (a * b - 1);
  this.matchColorOnly(0, 255, 255, 255) ? this.fillTransparent(1, 1) : this.matchColorOnly(d, 255, 255, 255) ? this.fillTransparent(1, b) : this.matchColorOnly(c, 255, 255, 255) ? this.fillTransparent(a, 1) : this.matchColorOnly(e, 255, 255, 255) && this.fillTransparent(a, b);
};
Entry.Painter.prototype.fillTransparent = function(a, b) {
  this.stage.mouseX = a;
  this.stage.mouseY = b;
  this.stroke.transparent = !0;
  this.fill();
};
Entry.Painter.prototype.trim = function() {
  var a = this.canvas.width, b = this.ctx.getImageData(0, 0, a, this.canvas.height), d = b.data.length, c, e = null, f = null, g = null, h = null, k;
  for (c = 0;c < d;c += 4) {
    0 !== b.data[c + 3] && (g = c / 4 % a, k = ~~(c / 4 / a), null === e && (e = k), null === f ? f = g : g < f && (f = g), null === h ? h = k : h < k && (h = k));
  }
  a = h - e;
  b = g - f;
  0 === a || 0 === b ? (e = this.ctx.getImageData(0, 0, 1, 1), e.data[0] = 255, e.data[1] = 255, e.data[2] = 255, e.data[3] = 255, this.canvas_.width = 1, this.canvas_.height = 1) : (e = this.ctx.getImageData(f, e, b, a), this.canvas_.width = b, this.canvas_.height = a);
  this.ctx_.putImageData(e, 0, 0);
};
Entry.Painter.prototype.showInputField = function(a) {
  this.inputField ? (Entry.dispatchEvent("textUpdate"), delete this.inputField) : (this.initCommand(), this.doCommand(), this.inputField = new CanvasInput({canvas:document.getElementById("entryPainterCanvas"), fontSize:20, fontFamily:this.font.name, fontColor:"#000", width:650, padding:8, borderWidth:1, borderColor:"#000", borderRadius:3, boxShadow:"1px 1px 0px #fff", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:a.stageX, y:a.stageY, onsubmit:function() {
    Entry.dispatchEvent("textUpdate");
  }}), this.inputField.show());
};
Entry.Painter.prototype.addPicture = function(a) {
  this.initCommand();
  var b = new Image;
  b.id = Entry.generateHash();
  b.src = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/image/" + a.filename + ".png";
  var d = this;
  b.onload = function(b) {
    d.addImage(b.target);
    d.selectToolbox("cursor");
  };
};
Entry.Painter.prototype.initCoordinator = function() {
  var a = new createjs.Container, b = new createjs.Bitmap(Entry.mediaFilePath + "/workspace_coordinate.png");
  a.addChild(b);
  this.stage.addChild(a);
  a.visible = !1;
  this.coordinator = a;
};
Entry.Painter.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  this.stage.update();
};
Entry.Painter.prototype.initDashedLine = function() {
  createjs.Graphics.prototype.dashedLineTo = function(a, b, d, c, e) {
    this.moveTo(a, b);
    var f = d - a, g = c - b;
    e = Math.floor(Math.sqrt(f * f + g * g) / e);
    for (var f = f / e, g = g / e, h = 0;h++ < e;) {
      a += f, b += g, this[0 === h % 2 ? "moveTo" : "lineTo"](a, b);
    }
    this[0 === h % 2 ? "moveTo" : "lineTo"](d, c);
    return this;
  };
  createjs.Graphics.prototype.drawDashedRect = function(a, b, d, c, e) {
    this.moveTo(a, b);
    d = a + d;
    c = b + c;
    this.dashedLineTo(a, b, d, b, e);
    this.dashedLineTo(d, b, d, c, e);
    this.dashedLineTo(d, c, a, c, e);
    this.dashedLineTo(a, c, a, b, e);
    return this;
  };
  createjs.Graphics.prototype.drawResizableDashedRect = function(a, b, d, c, e, f) {
    this.moveTo(a, b);
    d = a + d;
    c = b + c;
    this.dashedLineTo(a + f, b, d - f, b, e);
    this.dashedLineTo(d, b + f, d, c - f, e);
    this.dashedLineTo(d - f, c, a + f, c, e);
    this.dashedLineTo(a, c - f, a, b + f, e);
    return this;
  };
};
Entry.Painter.prototype.generateView = function(a) {
  var b = this;
  this.view_ = a;
  if (!Entry.type || "workspace" == Entry.type) {
    this.view_.addClass("entryPainterWorkspace");
    var d = Entry.createElement("div", "entryPainterTop");
    d.addClass("entryPlaygroundPainterTop");
    this.view_.appendChild(d);
    var c = Entry.createElement("div", "entryPainterToolbox");
    c.addClass("entryPlaygroundPainterToolbox");
    this.view_.appendChild(c);
    var e = Entry.createElement("div", "entryPainterToolboxTop");
    e.addClass("entryPainterToolboxTop");
    c.appendChild(e);
    var f = Entry.createElement("div", "entryPainterContainer");
    f.addClass("entryPlaygroundPainterContainer");
    this.view_.appendChild(f);
    e = Entry.createElement("canvas", "entryPainterCanvas");
    e.width = 960;
    e.height = 540;
    e.addClass("entryPlaygroundPainterCanvas");
    f.appendChild(e);
    e = Entry.createElement("canvas", "entryPainterCanvas_");
    e.addClass("entryRemove");
    e.width = 960;
    e.height = 540;
    f.appendChild(e);
    var g = Entry.createElement("div", "entryPainterAttr");
    g.addClass("entryPlaygroundPainterAttr");
    this.view_.appendChild(g);
    this.flipObject = Entry.createElement("div", "entryPictureFlip");
    this.flipObject.addClass("entryPlaygroundPainterFlip");
    g.appendChild(this.flipObject);
    e = Entry.createElement("div", "entryPictureFlipX");
    e.title = "\uc88c\uc6b0\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      b.selectedObject && (b.selectedObject.scaleX *= -1, b.selectedObject.text ? b.selectTextObject(b.selectedObject) : b.selectObject(b.selectedObject), b.updateImageHandle(), b.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipX");
    this.flipObject.appendChild(e);
    e = Entry.createElement("div", "entryPictureFlipY");
    e.title = "\uc0c1\ud558\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      b.selectedObject && (b.selectedObject.scaleY *= -1, b.selectedObject.text ? b.selectTextObject(b.selectedObject) : b.selectObject(b.selectedObject), b.updateImageHandle(), b.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipY");
    this.flipObject.appendChild(e);
    Entry.addEventListener("windowResized", function(b) {
      var d = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      b = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var c = parseInt(document.getElementById("entryCanvas").style.width), d = d - (c + 240), c = b - 349;
      a.style.width = d + "px";
      f.style.width = d - 54 + "px";
      f.style.height = c + "px";
      g.style.top = c + 30 + "px";
      g.style.height = b - c + "px";
    });
    var h = Entry.createElement("nav", "entryPainterTopMenu");
    h.addClass("entryPlaygroundPainterTopMenu");
    d.appendChild(h);
    e = Entry.createElement("ul");
    h.appendChild(e);
    var k = Entry.createElement("li");
    h.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuFileNew");
    h.bindOnClick(function() {
      b.newPicture();
    });
    h.addClass("entryPlaygroundPainterTopMenuFileNew");
    h.innerHTML = Lang.Workspace.new_picture;
    k.appendChild(h);
    h = Entry.createElement("li", "entryPainterTopMenuFile");
    h.addClass("entryPlaygroundPainterTopMenuFile");
    h.innerHTML = Lang.Workspace.painter_file;
    e.appendChild(h);
    k = Entry.createElement("ul");
    h.appendChild(k);
    h = Entry.createElement("li");
    k.appendChild(h);
    var l = Entry.createElement("a", "entryPainterTopMenuFileSave");
    l.bindOnClick(function() {
      b.file_save(!1);
    });
    l.addClass("entryPainterTopMenuFileSave");
    l.innerHTML = Lang.Workspace.painter_file_save;
    h.appendChild(l);
    h = Entry.createElement("li");
    k.appendChild(h);
    k = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    k.bindOnClick(function() {
      b.file.mode = "new";
      b.file_save(!1);
    });
    k.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    k.innerHTML = Lang.Workspace.painter_file_saveas;
    h.appendChild(k);
    k = Entry.createElement("li", "entryPainterTopMenuEdit");
    k.addClass("entryPlaygroundPainterTopMenuEdit");
    k.innerHTML = Lang.Workspace.painter_edit;
    e.appendChild(k);
    e = Entry.createElement("ul");
    k.appendChild(e);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    h.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    h.addClass("entryPainterTopMenuEditImport");
    h.innerHTML = Lang.Workspace.get_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    h.bindOnClick(function() {
      b.edit_copy();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCopy");
    h.innerHTML = Lang.Workspace.copy_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCut");
    h.bindOnClick(function() {
      b.edit_cut();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCut");
    h.innerHTML = Lang.Workspace.cut_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    h.bindOnClick(function() {
      b.edit_paste();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditPaste");
    h.innerHTML = Lang.Workspace.paste_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    e = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    e.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    e.innerHTML = Lang.Workspace.remove_all;
    e.bindOnClick(function() {
      b.clearCanvas();
    });
    k.appendChild(e);
    this.painterTopStageXY = e = Entry.createElement("div", "entryPainterTopStageXY");
    e.addClass("entryPlaygroundPainterTopStageXY");
    d.appendChild(e);
    e = Entry.createElement("ul", "entryPainterTopToolbar");
    e.addClass("entryPlaygroundPainterTopToolbar");
    d.appendChild(e);
    d = Entry.createElement("li", "entryPainterTopToolbarUndo");
    d.bindOnClick(function() {
    });
    d.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(d);
    d = Entry.createElement("li", "entryPainterTopToolbarRedo");
    d.bindOnClick(function() {
    });
    d.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(d);
    d = Entry.createElement("ul");
    d.addClass("entryPlaygroundPainterToolboxContainer");
    c.appendChild(d);
    this.toolboxCursor = Entry.createElement("li", "entryPainterToolboxCursor");
    this.toolboxCursor.title = "\uc774\ub3d9";
    this.toolboxCursor.bindOnClick(function() {
      b.selectToolbox("cursor");
    });
    this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
    d.appendChild(this.toolboxCursor);
    this.toolboxSelect = Entry.createElement("li", "entryPainterToolboxSelect");
    this.toolboxSelect.title = "\uc790\ub974\uae30";
    this.toolboxSelect.bindOnClick(function() {
      b.selectToolbox("select");
    });
    this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
    d.appendChild(this.toolboxSelect);
    this.toolboxPen = Entry.createElement("li", "entryPainterToolboxPen");
    this.toolboxPen.title = "\ud39c";
    this.toolboxPen.bindOnClick(function() {
      b.selectToolbox("pen");
    });
    this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
    d.appendChild(this.toolboxPen);
    this.toolboxLine = Entry.createElement("li", "entryPainterToolboxLine");
    this.toolboxLine.title = "\uc9c1\uc120";
    this.toolboxLine.bindOnClick(function() {
      b.selectToolbox("line");
    });
    this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
    d.appendChild(this.toolboxLine);
    this.toolboxRect = Entry.createElement("li", "entryPainterToolboxRect");
    this.toolboxRect.title = "\uc0ac\uac01\ud615";
    this.toolboxRect.bindOnClick(function() {
      b.selectToolbox("rect");
    });
    this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
    d.appendChild(this.toolboxRect);
    this.toolboxCircle = Entry.createElement("li", "entryPainterToolboxCircle");
    this.toolboxCircle.title = "\uc6d0";
    this.toolboxCircle.bindOnClick(function() {
      b.selectToolbox("circle");
    });
    this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
    d.appendChild(this.toolboxCircle);
    this.toolboxText = Entry.createElement("li", "entryPainterToolboxText");
    this.toolboxText.title = "\uae00\uc0c1\uc790";
    this.toolboxText.bindOnClick(function() {
      b.selectToolbox("text");
    });
    this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
    d.appendChild(this.toolboxText);
    this.toolboxFill = Entry.createElement("li", "entryPainterToolboxFill");
    this.toolboxFill.bindOnClick(function() {
      b.selectToolbox("fill");
    });
    this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
    d.appendChild(this.toolboxFill);
    this.toolboxErase = Entry.createElement("li", "entryPainterToolboxErase");
    this.toolboxErase.title = "\uc9c0\uc6b0\uae30";
    this.toolboxErase.bindOnClick(function() {
      b.selectToolbox("erase");
    });
    this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
    d.appendChild(this.toolboxErase);
    c = Entry.createElement("li", "entryPainterToolboxCoordinate");
    c.title = "\uc88c\ud45c";
    c.bindOnClick(function() {
      b.toggleCoordinator();
    });
    c.addClass("entryPlaygroundPainterToolboxCoordinate");
    d.appendChild(c);
    this.attrResizeArea = Entry.createElement("fieldset", "painterAttrResize");
    this.attrResizeArea.addClass("entryPlaygroundPainterAttrResize");
    g.appendChild(this.attrResizeArea);
    c = Entry.createElement("legend");
    c.innerHTML = Lang.Workspace.picture_size;
    this.attrResizeArea.appendChild(c);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrResizeX");
    this.attrResizeArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrResizeXTop");
    d.innerHTML = "X";
    c.appendChild(d);
    this.objectWidthInput = Entry.createElement("input", "entryPainterAttrWidth");
    this.objectWidthInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      b.handle.width = this.value;
      b.updateImageHandle();
    };
    this.objectWidthInput.addClass("entryPlaygroundPainterNumberInput");
    c.appendChild(this.objectWidthInput);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterSizeText");
    c.innerHTML = "x";
    this.attrResizeArea.appendChild(c);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundAttrReiszeY");
    this.attrResizeArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrResizeYTop");
    d.innerHTML = "Y";
    c.appendChild(d);
    this.objectHeightInput = Entry.createElement("input", "entryPainterAttrHeight");
    this.objectHeightInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      b.handle.height = this.value;
      b.updateImageHandle();
    };
    this.objectHeightInput.addClass("entryPlaygroundPainterNumberInput");
    c.appendChild(this.objectHeightInput);
    this.attrRotateArea = Entry.createElement("div", "painterAttrRotateArea");
    this.attrRotateArea.addClass("painterAttrRotateArea");
    g.appendChild(this.attrRotateArea);
    c = Entry.createElement("fieldset", "entryPainterAttrRotate");
    c.addClass("entryPlaygroundPainterAttrRotate");
    this.attrRotateArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("painterAttrRotateName");
    d.innerHTML = Lang.Workspace.picture_rotation;
    this.attrRotateArea.appendChild(d);
    d = Entry.createElement("div");
    d.addClass("painterAttrRotateTop");
    d.innerHTML = "\u03bf";
    c.appendChild(d);
    this.objectRotateInput = Entry.createElement("input", "entryPainterAttrDegree");
    this.objectRotateInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      360 <= this.value ? this.value %= 360 : 0 > this.value && (this.value = 360 + this.value % 360);
      b.handle.rotation = this.value;
      b.updateImageHandle();
    };
    this.objectRotateInput.addClass("entryPlaygroundPainterNumberInput");
    this.objectRotateInput.defaultValue = "0";
    c.appendChild(this.objectRotateInput);
    this.attrColorArea = Entry.createElement("fieldset", "entryPainterAttrColor");
    this.attrColorArea.addClass("entryPlaygroundPainterAttrColor");
    g.appendChild(this.attrColorArea);
    var m = Entry.createElement("div");
    m.addClass("entryPlaygroundPainterAttrColorContainer");
    this.attrColorArea.appendChild(m);
    this.attrCircleArea = Entry.createElement("div");
    this.attrCircleArea.addClass("painterAttrCircleArea");
    g.appendChild(this.attrCircleArea);
    c = Entry.createElement("div", "entryPainterAttrCircle");
    c.addClass("painterAttrCircle");
    this.attrCircleArea.appendChild(c);
    this.attrCircleArea.painterAttrCircle = c;
    c = Entry.createElement("input", "entryPainterAttrCircleInput");
    c.value = "#000000";
    c.addClass("painterAttrCircleInput");
    this.attrCircleArea.appendChild(c);
    this.attrColorSpoid = Entry.createElement("div");
    this.attrColorSpoid.bindOnClick(function() {
      b.selectToolbox("spoid");
    });
    this.attrColorSpoid.addClass("painterAttrColorSpoid");
    g.appendChild(this.attrColorSpoid);
    Entry.getColourCodes().forEach(function(a) {
      var d = Entry.createElement("div");
      d.addClass("entryPlaygroundPainterAttrColorElement");
      "transparent" === a ? d.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/transparent.png") + ")" : d.style.backgroundColor = a;
      d.bindOnClick(function(d) {
        "transparent" === a ? (b.stroke.transparent = !0, b.stroke.lineColor = "#ffffff") : (b.stroke.transparent = !1, r && (document.getElementById("entryPainterShapeBackgroundColor").style.backgroundColor = a, b.stroke.fillColor = a), r || (document.getElementById("entryPainterShapeLineColor").style.backgroundColor = a, b.stroke.lineColor = a));
        document.getElementById("entryPainterAttrCircle").style.backgroundColor = b.stroke.lineColor;
        document.getElementById("entryPainterAttrCircleInput").value = a;
      });
      m.appendChild(d);
    });
    this.attrThickArea = Entry.createElement("div", "painterAttrThickArea");
    this.attrThickArea.addClass("entryPlaygroundentryPlaygroundPainterAttrThickArea");
    g.appendChild(this.attrThickArea);
    c = Entry.createElement("legend");
    c.addClass("painterAttrThickName");
    c.innerHTML = Lang.Workspace.thickness;
    this.attrThickArea.appendChild(c);
    var n = Entry.createElement("fieldset", "entryPainterAttrThick");
    n.addClass("entryPlaygroundPainterAttrThick");
    this.attrThickArea.appendChild(n);
    c = Entry.createElement("div");
    c.addClass("paintAttrThickTop");
    n.appendChild(c);
    e = Entry.createElement("select", "entryPainterAttrThick");
    e.addClass("entryPlaygroundPainterAttrThickInput");
    e.size = "1";
    e.onchange = function(a) {
      b.stroke.thickness = a.target.value;
    };
    for (c = 1;10 >= c;c++) {
      d = Entry.createElement("option"), d.value = c, d.innerHTML = c, e.appendChild(d);
    }
    n.appendChild(e);
    c = Entry.createElement("div", "entryPainterShapeLineColor");
    c.addClass("painterAttrShapeLineColor");
    d = Entry.createElement("div", "entryPainterShapeInnerBackground");
    d.addClass("painterAttrShapeInnerBackground");
    c.appendChild(d);
    n.appendChild(c);
    this.attrThickArea.painterAttrShapeLineColor = c;
    n.bindOnClick(function() {
      q.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !1;
    });
    this.attrBackgroundArea = Entry.createElement("div", "painterAttrBackgroundArea");
    this.attrBackgroundArea.addClass("entryPlaygroundPainterBackgroundArea");
    g.appendChild(this.attrBackgroundArea);
    c = Entry.createElement("fieldset", "entryPainterAttrbackground");
    c.addClass("entryPlaygroundPainterAttrBackground");
    this.attrBackgroundArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("paintAttrBackgroundTop");
    c.appendChild(d);
    var q = Entry.createElement("div", "entryPainterShapeBackgroundColor");
    q.addClass("painterAttrShapeBackgroundColor");
    this.attrBackgroundArea.painterAttrShapeBackgroundColor = q;
    d.appendChild(q);
    var r = !1;
    q.bindOnClick(function(b) {
      n.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !0;
    });
    this.attrFontArea = Entry.createElement("div", "painterAttrFont");
    this.attrFontArea.addClass("entryPlaygroundPainterAttrFont");
    g.appendChild(this.attrFontArea);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrTop");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPaintAttrTop_");
    e.appendChild(c);
    c = Entry.createElement("legend");
    c.addClass("panterAttrFontTitle");
    c.innerHTML = Lang.Workspace.textStyle;
    k = Entry.createElement("select", "entryPainterAttrFontName");
    k.addClass("entryPlaygroundPainterAttrFontName");
    k.size = "1";
    k.onchange = function(a) {
      b.font.name = a.target.value;
    };
    for (c = 0;c < Entry.fonts.length;c++) {
      h = Entry.fonts[c], d = Entry.createElement("option"), d.value = h.family, d.innerHTML = h.name, k.appendChild(d);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("painterAttrFontSizeArea");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("painterAttrFontSizeTop");
    e.appendChild(c);
    k = Entry.createElement("select", "entryPainterAttrFontSize");
    k.addClass("entryPlaygroundPainterAttrFontSize");
    k.size = "1";
    k.onchange = function(a) {
      b.font.size = a.target.value;
    };
    for (c = 20;72 >= c;c++) {
      d = Entry.createElement("option"), d.value = c, d.innerHTML = c, k.appendChild(d);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrFontStyleArea");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrFontTop");
    e.appendChild(c);
    k = Entry.createElement("select", "entryPainterAttrFontStyle");
    k.addClass("entryPlaygroundPainterAttrFontStyle");
    k.size = "1";
    k.onchange = function(a) {
      b.font.style = a.target.value;
    };
    h = [{label:"\ubcf4\ud1b5", value:"normal"}, {label:"\uad75\uac8c", value:"bold"}, {label:"\uae30\uc6b8\uc784", value:"italic"}];
    for (c = 0;c < h.length;c++) {
      l = h[c], d = Entry.createElement("option"), d.value = l.value, d.innerHTML = l.label, k.appendChild(d);
    }
    e.appendChild(k);
    this.attrLineArea = Entry.createElement("div", "painterAttrLineStyle");
    this.attrLineArea.addClass("entryPlaygroundPainterAttrLineStyle");
    g.appendChild(this.attrLineArea);
    var t = Entry.createElement("div");
    t.addClass("entryPlaygroundPainterAttrLineStyleLine");
    this.attrLineArea.appendChild(t);
    var u = Entry.createElement("div");
    u.addClass("entryPlaygroundPaitnerAttrLineArea");
    this.attrLineArea.appendChild(u);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrLineStyleLine1");
    u.appendChild(c);
    c.value = "line";
    var v = Entry.createElement("div");
    v.addClass("painterAttrLineStyleBackgroundLine");
    t.bindOnClick(function(b) {
      u.removeClass("entryRemove");
    });
    u.blur = function(b) {
      this.addClass("entryRemove");
    };
    u.onmouseleave = function(b) {
      this.addClass("entryRemove");
    };
    c.bindOnClick(function(b) {
      this.attrLineArea.removeClass(t);
      this.attrLineArea.appendChild(v);
      this.attrLineArea.onchange(b);
      u.blur();
    });
    v.bindOnClick(function(b) {
      u.removeClass("entryRemove");
    });
    this.attrLineArea.onchange = function(a) {
      b.stroke.style = a.target.value;
    };
    u.blur();
  }
};
Entry.Painter.prototype.restoreHandle = function() {
  this.selectedObject && !1 === this.handle.visible && (this.handle.visible = !0, this.stage.update());
};
Entry.Painter.prototype.initDisplay = function() {
  this.stroke.enabled = !1;
  this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
  this.toolboxCursor.removeClass("entryToolboxCursorClicked");
  this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
  this.toolboxSelect.removeClass("entryToolboxSelectClicked");
  this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
  this.toolboxPen.removeClass("entryToolboxPenClicked");
  this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
  this.toolboxLine.removeClass("entryToolboxLineClicked");
  this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
  this.toolboxRect.removeClass("entryToolboxRectClicked");
  this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
  this.toolboxCircle.removeClass("entryToolBoxCircleClicked");
  this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
  this.toolboxText.removeClass("entryToolBoxTextClicked");
  this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
  this.toolboxFill.removeClass("entryToolBoxFillClicked");
  this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
  this.toolboxErase.removeClass("entryToolBoxEraseClicked");
  this.attrColorSpoid.addClass("painterAttrColorSpoid");
  this.attrColorSpoid.removeClass("painterAttrColorSpoidClicked");
  this.attrResizeArea.addClass("entryRemove");
  this.attrRotateArea.addClass("entryRemove");
  this.attrThickArea.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrLineArea.addClass("entryRemove");
  this.attrColorArea.addClass("entryRemove");
  this.attrCircleArea.addClass("entryRemove");
  this.attrColorSpoid.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrBackgroundArea.addClass("entryRemove");
  this.flipObject.addClass("entryRemove");
  this.attrThickArea.painterAttrShapeLineColor.addClass("entryRemove");
  this.attrBackgroundArea.painterAttrShapeBackgroundColor.addClass("entryRemove");
  this.attrCircleArea.painterAttrCircle.addClass("entryRemove");
  this.inputField && !this.inputField._isHidden && (this.inputField.hide(), this.stage.update());
};
Entry.Painter.prototype.selectToolbox = function(a) {
  this.toolbox.selected = a;
  "erase" != a && $(".entryPlaygroundPainterContainer").removeClass("dd");
  this.initDisplay();
  "cursor" !== a && this.clearHandle();
  "text" !== a && this.inputField && delete this.inputField;
  switch(a) {
    case "cursor":
      this.restoreHandle();
      this.toolboxCursor.addClass("entryToolboxCursorClicked");
      this.attrResizeArea.removeClass("entryRemove");
      this.attrRotateArea.removeClass("entryRemove");
      this.flipObject.removeClass("entryRemove");
      break;
    case "select":
      this.toolboxSelect.addClass("entryToolboxSelectClicked");
      break;
    case "pen":
      this.toolboxPen.addClass("entryToolboxPenClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "line":
      this.toolboxLine.addClass("entryToolboxLineClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "rect":
      this.toolboxRect.addClass("entryToolboxRectClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "circle":
      this.toolboxCircle.addClass("entryToolBoxCircleClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "text":
      this.toolboxText.addClass("entryToolBoxTextClicked");
      this.attrFontArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "fill":
      this.toolboxFill.addClass("entryToolBoxFillClicked");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "erase":
      $(".entryPlaygroundPainterContainer").addClass("dd");
      this.toolboxErase.addClass("entryToolBoxEraseClicked");
      this.attrThickArea.removeClass("entryRemove");
      break;
    case "spoid":
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("painterAttrColorSpoid");
      this.attrColorSpoid.addClass("painterAttrColorSpoidClicked");
      break;
    case "coordinate":
      this.toggleCoordinator();
  }
};
Entry.Pdf = function(a) {
  this.generateView(a);
};
p = Entry.Pdf.prototype;
p.generateView = function(a) {
  var b = Entry.createElement("div", "entryPdfWorkspace");
  b.addClass("entryRemove");
  this._view = b;
  var d = "/pdfjs/web/viewer.html";
  a && "" != a && (d += "?file=" + a);
  pdfViewIframe = Entry.createElement("iframe", "entryPdfIframeWorkspace");
  pdfViewIframe.setAttribute("id", "pdfViewIframe");
  pdfViewIframe.setAttribute("frameborder", 0);
  pdfViewIframe.setAttribute("src", d);
  b.appendChild(pdfViewIframe);
};
p.getView = function() {
  return this._view;
};
p.resize = function() {
  var a = document.getElementById("entryContainerWorkspaceId"), b = document.getElementById("pdfViewIframe");
  w = a.offsetWidth;
  b.width = w + "px";
  b.height = 9 * w / 16 + "px";
};
Entry.FieldTrashcan = function(a) {
  a && this.setBoard(a);
  this.dragBlockObserver = this.dragBlock = null;
  this.isOver = !1;
  Entry.windowResized && Entry.windowResized.attach(this, this.setPosition);
};
(function(a) {
  a._generateView = function() {
    this.svgGroup = this.board.svg.elem("g");
    this.renderStart();
    this._addControl();
  };
  a.renderStart = function() {
    var b = Entry.mediaFilePath + "delete_";
    this.trashcanTop = this.svgGroup.elem("image", {href:b + "cover.png", width:60, height:20});
    this.svgGroup.elem("image", {href:b + "body.png", y:20, width:60, height:60});
  };
  a._addControl = function() {
    $(this.svgGroup).bind("mousedown", function(b) {
      Entry.Utils.isRightButton(b) && (b.stopPropagation(), $("#entryWorkspaceBoard").css("background", "white"));
    });
  };
  a.updateDragBlock = function() {
    var b = this.board.dragBlock, a = this.dragBlockObserver;
    a && (a.destroy(), this.dragBlockObserver = null);
    b ? this.dragBlockObserver = b.observe(this, "checkBlock", ["x", "y"]) : (this.isOver && this.dragBlock && !this.dragBlock.block.getPrevBlock() && (this.dragBlock.block.doDestroyBelow(!0), createjs.Sound.play("entryDelete")), this.tAnimation(!1));
    this.dragBlock = b;
  };
  a.checkBlock = function() {
    var b = this.dragBlock;
    if (b && b.block.isDeletable()) {
      var a = this.board.offset(), c = this.getPosition(), e = c.x + a.left, a = c.y + a.top, f, g;
      if (b = b.dragInstance) {
        f = b.offsetX, g = b.offsetY;
      }
      this.tAnimation(f >= e && g >= a);
    }
  };
  a.align = function() {
    var b = this.getPosition();
    this.svgGroup.attr({transform:"translate(" + b.x + "," + b.y + ")"});
  };
  a.setPosition = function() {
    if (this.board) {
      var b = this.board.svgDom;
      this._x = b.width() - 110;
      this._y = b.height() - 110;
      this.align();
    }
  };
  a.getPosition = function() {
    return {x:this._x, y:this._y};
  };
  a.tAnimation = function(b) {
    if (b !== this.isOver) {
      b = void 0 === b ? !0 : b;
      var a, c = this.trashcanTop;
      a = b ? {translateX:15, translateY:-25, rotateZ:30} : {translateX:0, translateY:0, rotateZ:0};
      $(c).velocity(a, {duration:50});
      this.isOver = b;
    }
  };
  a.setBoard = function(b) {
    this._dragBlockObserver && this._dragBlockObserver.destroy();
    this.board = b;
    this.svgGroup || this._generateView();
    var a = b.svg, c = a.firstChild;
    c ? a.insertBefore(this.svgGroup, c) : a.appendChild(this.svgGroup);
    this._dragBlockObserver = b.observe(this, "updateDragBlock", ["dragBlock"]);
    this.svgGroup.attr({filter:"url(#entryTrashcanFilter_" + b.suffix + ")"});
    this.setPosition();
  };
})(Entry.FieldTrashcan.prototype);
Entry.Workspace = function(a) {
  Entry.Model(this, !1);
  this.observe(this, "_handleChangeBoard", ["selectedBoard"], !1);
  this.trashcan = new Entry.FieldTrashcan;
  var b = a.blockMenu;
  b && (this.blockMenu = new Entry.BlockMenu(b.dom, b.align, b.categoryData, b.scroll), this.blockMenu.workspace = this, this.blockMenu.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1));
  if (b = a.board) {
    b.workspace = this, this.board = new Entry.Board(b), this.board.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1), this.set({selectedBoard:this.board});
  }
  if (b = a.vimBoard) {
    this.vimBoard = new Entry.Vim(b.dom), this.vimBoard.workspace = this;
  }
  this.board && this.vimBoard && this.vimBoard.hide();
  Entry.GlobalSvg.createDom();
  this.mode = Entry.Workspace.MODE_BOARD;
  Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
  this.changeEvent = new Entry.Event(this);
  Entry.commander.setCurrentEditor("board", this.board);
};
Entry.Workspace.MODE_BOARD = 0;
Entry.Workspace.MODE_VIMBOARD = 1;
Entry.Workspace.MODE_OVERLAYBOARD = 2;
(function(a) {
  a.schema = {selectedBlockView:null, selectedBoard:null};
  a.getBoard = function() {
    return this.board;
  };
  a.getSelectedBoard = function() {
    return this.selectedBoard;
  };
  a.getBlockMenu = function() {
    return this.blockMenu;
  };
  a.getVimBoard = function() {
    return this.vimBoard;
  };
  a.getMode = function() {
    return this.mode;
  };
  a.setMode = function(b, a) {
    b = Number(b);
    var c = this.mode;
    this.mode = b;
    var e = this.textType;
    this.textType = a;
    switch(b) {
      case c:
        return;
      case Entry.Workspace.MODE_VIMBOARD:
        this.board && this.board.hide();
        this.overlayBoard && this.overlayBoard.hide();
        this.set({selectedBoard:this.vimBoard});
        this.vimBoard.show();
        this.codeToText(this.board.code);
        this.blockMenu.renderText();
        this.board.clear();
        break;
      case Entry.Workspace.MODE_BOARD:
        try {
          this.board.show(), this.set({selectedBoard:this.board}), this.textToCode(c, e), this.vimBoard && this.vimBoard.hide(), this.overlayBoard && this.overlayBoard.hide(), this.blockMenu.renderBlock();
        } catch (f) {
          throw this.board && this.board.hide(), this.set({selectedBoard:this.vimBoard}), Entry.dispatchEvent("setProgrammingMode", Entry.Workspace.MODE_VIMBOARD), f;
        }
        Entry.commander.setCurrentEditor("board", this.board);
        break;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        this.overlayBoard || this.initOverlayBoard(), this.overlayBoard.show(), this.set({selectedBoard:this.overlayBoard}), Entry.commander.setCurrentEditor("board", this.overlayBoard);
    }
    this.changeEvent.notify(a);
  };
  a.changeBoardCode = function(b) {
    this._syncTextCode();
    this.board.changeCode(b);
    this.mode === Entry.Workspace.MODE_VIMBOARD && this.codeToText(this.board.code);
  };
  a.changeOverlayBoardCode = function(b) {
    this.overlayBoard && this.overlayBoard.changeCode(b);
  };
  a.changeBlockMenuCode = function(b) {
    this.blockMenu.changeCode(b);
  };
  a.textToCode = function(b, a) {
    if (b == Entry.Workspace.MODE_VIMBOARD) {
      b = this.vimBoard.textToCode(a);
      a = this.board;
      var c = a.code;
      c.load(b);
      c.createView(a);
      this.board.alignThreads();
      this.board.reDraw();
    }
  };
  a.loadCodeFromText = function(b) {
    b == Entry.Workspace.MODE_VIMBOARD && (b = this.vimBoard.textToCode(this.textType), this.board.code.load(b));
  };
  a.codeToText = function(b) {
    return this.vimBoard.codeToText(b);
  };
  a.getCodeToText = function(b) {
    return this.vimBoard.getCodeToText(b);
  };
  a._setSelectedBlockView = function() {
    this.set({selectedBlockView:this.board.selectedBlockView || this.blockMenu.selectedBlockView || (this.overlayBoard ? this.overlayBoard.selectedBlockView : null)});
  };
  a.initOverlayBoard = function() {
    this.overlayBoard = new Entry.Board({dom:this.board.view, workspace:this, isOverlay:!0});
    this.overlayBoard.changeCode(new Entry.Code([]));
    this.overlayBoard.workspace = this;
    this.overlayBoard.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1);
  };
  a._keyboardControl = function(b) {
    var a = b.keyCode || b.which, c = b.ctrlKey;
    if (!Entry.Utils.isInInput(b)) {
      var e = this.selectedBlockView;
      e && !e.isInBlockMenu && e.block.isDeletable() && (8 == a || 46 == a ? (Entry.do("destroyBlock", e.block), b.preventDefault()) : c && (67 == a ? e.block.copyToClipboard() : 88 == a && (b = e.block, b.copyToClipboard(), b.destroy(!0, !0), e.getBoard().setSelectedBlock(null))));
      c && 86 == a && (a = this.selectedBoard) && a instanceof Entry.Board && Entry.clipboard && Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }
  };
  a._handleChangeBoard = function() {
    var b = this.selectedBoard;
    b && b.constructor === Entry.Board && this.trashcan.setBoard(b);
  };
  a._syncTextCode = function() {
    if (this.mode === Entry.Workspace.MODE_VIMBOARD) {
      var b = this.vimBoard.textToCode(this.textType), a = this.board, c = a.code;
      c.load(b);
      c.createView(a);
      this.board.alignThreads();
    }
  };
})(Entry.Workspace.prototype);
Entry.BlockDriver = function() {
};
(function(a) {
  a.convert = function() {
    var b = new Date, a;
    for (a in Entry.block) {
      "function" === typeof Entry.block[a] && this._convertBlock(a);
    }
    console.log((new Date).getTime() - b.getTime());
  };
  a._convertBlock = function(b) {
    function a(b) {
      var c = {type:b.getAttribute("type"), index:{}};
      b = $(b).children();
      if (!b) {
        return c;
      }
      for (var e = 0;e < b.length;e++) {
        var f = b[e], g = f.tagName, h = $(f).children()[0], t = f.getAttribute("name");
        "value" === g ? "block" == h.nodeName && (c.params || (c.params = []), c.params.push(a(h)), c.index[t] = c.params.length - 1) : "field" === g && (c.params || (c.params = []), c.params.push(f.textContent), c.index[t] = c.params.length - 1);
      }
      return c;
    }
    var c = Blockly.Blocks[b], e = EntryStatic.blockInfo[b], f, g;
    if (e && (f = e.class, g = e.isNotFor, e = e.xml)) {
      var e = $.parseXML(e), h = a(e.childNodes[0])
    }
    c = (new Entry.BlockMockup(c, h, b)).toJSON();
    c.class = f;
    c.isNotFor = g;
    _.isEmpty(c.paramsKeyMap) && delete c.paramsKeyMap;
    _.isEmpty(c.statementsKeyMap) && delete c.statementsKeyMap;
    c.func = Entry.block[b];
    -1 < "NUMBER TRUE FALSE TEXT FUNCTION_PARAM_BOOLEAN FUNCTION_PARAM_STRING TRUE_UN".split(" ").indexOf(b.toUpperCase()) && (c.isPrimitive = !0);
    Entry.block[b] = c;
  };
})(Entry.BlockDriver.prototype);
Entry.BlockMockup = function(a, b, d) {
  this.templates = [];
  this.params = [];
  this.statements = [];
  this.color = "";
  this.output = this.isNext = this.isPrev = !1;
  this.fieldCount = 0;
  this.events = {};
  this.def = b || {};
  this.paramsKeyMap = {};
  this.statementsKeyMap = {};
  this.definition = {params:[], type:this.def.type};
  this.simulate(a);
  this.def = this.definition;
};
(function(a) {
  a.simulate = function(b) {
    b.sensorList && (this.sensorList = b.sensorList);
    b.portList && (this.portList = b.portList);
    b.init.call(this);
    b.whenAdd && (this.events.blockViewAdd || (this.events.blockViewAdd = []), this.events.blockViewAdd.push(b.whenAdd));
    b.whenRemove && (this.events.blockViewDestroy || (this.events.blockViewDestroy = []), this.events.blockViewDestroy.push(b.whenRemove));
  };
  a.toJSON = function() {
    function b(a) {
      if (a && (a = a.params)) {
        for (var d = 0;d < a.length;d++) {
          var c = a[d];
          c && (delete c.index, b(c));
        }
      }
    }
    var a = "";
    this.output ? a = "Boolean" === this.output ? "basic_boolean_field" : "basic_string_field" : !this.isPrev && this.isNext ? a = "basic_event" : 1 == this.statements.length ? a = "basic_loop" : 2 == this.statements.length ? a = "basic_double_loop" : this.isPrev && this.isNext ? a = "basic" : this.isPrev && !this.isNext && (a = "basic_without_next");
    b(this.def);
    var c = /dummy_/mi, e;
    for (e in this.paramsKeyMap) {
      c.test(e) && delete this.paramsKeyMap[e];
    }
    for (e in this.statementsKeyMap) {
      c.test(e) && delete this.statementsKeyMap[e];
    }
    return {color:this.color, skeleton:a, statements:this.statements, template:this.templates.filter(function(b) {
      return "string" === typeof b;
    }).join(" "), params:this.params, events:this.events, def:this.def, paramsKeyMap:this.paramsKeyMap, statementsKeyMap:this.statementsKeyMap};
  };
  a.appendDummyInput = function() {
    return this;
  };
  a.appendValueInput = function(b) {
    this.def && this.def.index && (void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(null));
    this.params.push({type:"Block", accept:"string"});
    this._addToParamsKeyMap(b);
    this.templates.push(this.getFieldCount());
    return this;
  };
  a.appendStatementInput = function(b) {
    this._addToStatementsKeyMap(b);
    this.statements.push({accept:"basic"});
  };
  a.setCheck = function(b) {
    var a = this.params;
    "Boolean" === b && (a[a.length - 1].accept = "boolean");
  };
  a.appendField = function(b, a) {
    if (!b) {
      return this;
    }
    "string" === typeof b && 0 < b.length ? a ? (b = {type:"Text", text:b, color:a}, this.params.push(b), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(void 0)) : this.templates.push(b) : b.constructor == Blockly.FieldIcon ? ("start" === b.type ? this.params.push({type:"Indicator", img:b.src_, size:17, position:{x:0, y:-2}}) : 
    this.params.push({type:"Indicator", img:b.src_, size:12}), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.definition && this.definition.params.push(null)) : b.constructor == Blockly.FieldDropdown ? (this.params.push({type:"Dropdown", options:b.menuGenerator_, value:b.menuGenerator_[0][1], fontSize:11}), this._addToParamsKeyMap(a), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : 
    this.definition.params.push(void 0)) : b.constructor == Blockly.FieldDropdownDynamic ? (this.params.push({type:"DropdownDynamic", value:null, menuName:b.menuName_, fontSize:11}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(a)) : b.constructor == Blockly.FieldTextInput ? (this.params.push({type:"TextInput", value:10}), 
    this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(a)) : b.constructor == Blockly.FieldAngle ? (this.params.push({type:"Angle"}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(null), this._addToParamsKeyMap(a)) : b.constructor == Blockly.FieldKeydownInput ? (this.params.push({type:"Keyboard", value:81}), this.templates.push(this.getFieldCount()), 
    void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(a)) : b.constructor == Blockly.FieldColour ? (this.params.push({type:"Color"}), this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(a)) : console.log("else", b);
    return this;
  };
  a.setColour = function(b) {
    this.color = b;
  };
  a.setInputsInline = function() {
  };
  a.setOutput = function(b, a) {
    b && (this.output = a);
  };
  a.setPreviousStatement = function(b) {
    this.isPrev = b;
  };
  a.setNextStatement = function(b) {
    this.isNext = b;
  };
  a.setEditable = function(b) {
  };
  a.getFieldCount = function() {
    this.fieldCount++;
    return "%" + this.fieldCount;
  };
  a._addToParamsKeyMap = function(b) {
    b = b ? b : "dummy_" + Entry.Utils.generateId();
    var a = this.paramsKeyMap;
    a[b] = Object.keys(a).length;
  };
  a._addToStatementsKeyMap = function(b) {
    b = b ? b : "dummy_" + Entry.Utils.generateId();
    var a = this.statementsKeyMap;
    a[b] = Object.keys(a).length;
  };
})(Entry.BlockMockup.prototype);
Entry.Playground = function() {
  this.enableArduino = this.isTextBGMode_ = !1;
  this.viewMode_ = "default";
  var a = this;
  Entry.addEventListener("textEdited", this.injectText);
  Entry.addEventListener("hwChanged", this.updateHW);
  Entry.addEventListener("changeMode", function(b) {
    a.setMode(b);
  });
};
Entry.Playground.prototype.setMode = function(a) {
  this.mainWorkspace.setMode(a.boardType, a.textType);
};
Entry.Playground.prototype.generateView = function(a, b) {
  this.view_ = a;
  this.view_.addClass("entryPlayground");
  b && "workspace" != b ? "phone" == b && (this.view_.addClass("entryPlaygroundPhone"), a = Entry.createElement("div", "entryCategoryTab"), a.addClass("entryPlaygroundTabPhone"), Entry.view_.insertBefore(a, this.view_), this.generateTabView(a), this.tabView_ = a, a = Entry.createElement("div", "entryCurtain"), a.addClass("entryPlaygroundCurtainPhone"), a.addClass("entryRemove"), a.innerHTML = Lang.Workspace.cannot_edit_click_to_stop, a.bindOnClick(function() {
    Entry.engine.toggleStop();
  }), this.view_.appendChild(a), this.curtainView_ = a, Entry.pictureEditable && (a = Entry.createElement("div", "entryPicture"), a.addClass("entryPlaygroundPicturePhone"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generatePictureView(a), this.pictureView_ = a), a = Entry.createElement("div", "entryText"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generateTextView(a), this.textView_ = a, Entry.soundEditable && (a = Entry.createElement("div", "entrySound"), a.addClass("entryPlaygroundSoundWorkspacePhone"), 
  a.addClass("entryRemove"), this.view_.appendChild(a), this.generateSoundView(a), this.soundView_ = a), a = Entry.createElement("div", "entryDefault"), this.view_.appendChild(a), this.generateDefaultView(a), this.defaultView_ = a, a = Entry.createElement("div", "entryCode"), a.addClass("entryPlaygroundCodePhone"), this.view_.appendChild(a), this.generateCodeView(a), this.codeView_ = this.codeView_ = a, Entry.addEventListener("run", function(b) {
    Entry.playground.curtainView_.removeClass("entryRemove");
  }), Entry.addEventListener("stop", function(b) {
    Entry.playground.curtainView_.addClass("entryRemove");
  })) : (this.view_.addClass("entryPlaygroundWorkspace"), a = Entry.createElement("div", "entryCategoryTab"), a.addClass("entryPlaygroundTabWorkspace"), this.view_.appendChild(a), this.generateTabView(a), this.tabView_ = a, a = Entry.createElement("div", "entryCurtain"), a.addClass("entryPlaygroundCurtainWorkspace"), a.addClass("entryRemove"), b = Lang.Workspace.cannot_edit_click_to_stop.split("."), a.innerHTML = b[0] + ".<br/>" + b[1], a.addEventListener("click", function() {
    Entry.engine.toggleStop();
  }), this.view_.appendChild(a), this.curtainView_ = a, Entry.pictureEditable && (a = Entry.createElement("div", "entryPicture"), a.addClass("entryPlaygroundPictureWorkspace"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generatePictureView(a), this.pictureView_ = a), a = Entry.createElement("div", "entryText"), a.addClass("entryPlaygroundTextWorkspace"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generateTextView(a), this.textView_ = a, Entry.soundEditable && (a = 
  Entry.createElement("div", "entrySound"), a.addClass("entryPlaygroundSoundWorkspace"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generateSoundView(a), this.soundView_ = a), a = Entry.createElement("div", "entryDefault"), a.addClass("entryPlaygroundDefaultWorkspace"), this.view_.appendChild(a), this.generateDefaultView(a), this.defaultView_ = a, a = Entry.createElement("div", "entryCode"), a.addClass("entryPlaygroundCodeWorkspace"), a.addClass("entryRemove"), this.view_.appendChild(a), 
  this.generateCodeView(a), this.codeView_ = a, b = Entry.createElement("div"), b.addClass("entryPlaygroundResizeWorkspace", "entryRemove"), this.resizeHandle_ = b, this.view_.appendChild(b), this.initializeResizeHandle(b), this.codeView_ = a, Entry.addEventListener("run", function(b) {
    Entry.playground.curtainView_.removeClass("entryRemove");
  }), Entry.addEventListener("stop", function(b) {
    Entry.playground.curtainView_.addClass("entryRemove");
  }));
};
Entry.Playground.prototype.generateDefaultView = function(a) {
  return a;
};
Entry.Playground.prototype.generateTabView = function(a) {
  var b = this, d = Entry.createElement("ul");
  d.addClass("entryTabListWorkspace");
  this.tabList_ = d;
  a.appendChild(d);
  this.tabViewElements = {};
  a = Entry.createElement("li", "entryCodeTab");
  a.innerHTML = Lang.Workspace.tab_code;
  a.addClass("entryTabListItemWorkspace");
  a.addClass("entryTabSelected");
  d.appendChild(a);
  a.bindOnClick(function(a) {
    b.changeViewMode("code");
    b.blockMenu.reDraw();
  });
  this.tabViewElements.code = a;
  Entry.pictureEditable && (a = Entry.createElement("li", "entryPictureTab"), a.innerHTML = Lang.Workspace.tab_picture, a.addClass("entryTabListItemWorkspace"), d.appendChild(a), a.bindOnClick(function(b) {
    Entry.playground.changeViewMode("picture");
  }), this.tabViewElements.picture = a, a = Entry.createElement("li", "entryTextboxTab"), a.innerHTML = Lang.Workspace.tab_text, a.addClass("entryTabListItemWorkspace"), d.appendChild(a), a.bindOnClick(function(b) {
    Entry.playground.changeViewMode("text");
  }), this.tabViewElements.text = a, a.addClass("entryRemove"));
  Entry.soundEditable && (a = Entry.createElement("li", "entrySoundTab"), a.innerHTML = Lang.Workspace.tab_sound, a.addClass("entryTabListItemWorkspace"), d.appendChild(a), a.bindOnClick(function(b) {
    Entry.playground.changeViewMode("sound");
  }), this.tabViewElements.sound = a);
  Entry.hasVariableManager && (a = Entry.createElement("li", "entryVariableTab"), a.innerHTML = Lang.Workspace.tab_attribute, a.addClass("entryTabListItemWorkspace"), a.addClass("entryVariableTabWorkspace"), d.appendChild(a), a.bindOnClick(function(b) {
    Entry.playground.toggleOnVariableView();
    Entry.playground.changeViewMode("variable");
  }), this.tabViewElements.variable = a);
};
Entry.Playground.prototype.generateCodeView = function(a) {
  var b = this.createVariableView();
  a.appendChild(b);
  this.variableView_ = b;
  a = Entry.Dom(a);
  b = Entry.Dom("div", {parent:a, id:"entryWorkspaceBoard", class:"entryWorkspaceBoard"});
  a = Entry.Dom("div", {parent:a, id:"entryWorkspaceBlockMenu", class:"entryWorkspaceBlockMenu"});
  this.mainWorkspace = new Entry.Workspace({blockMenu:{dom:a, align:"LEFT", categoryData:EntryStatic.getAllBlocks(), scroll:!0}, board:{dom:b}, vimBoard:{dom:b}});
  this.blockMenu = this.mainWorkspace.blockMenu;
  this.board = this.mainWorkspace.board;
  this.vimBoard = this.mainWorkspace.vimBoard;
  Entry.hw && this.updateHW();
};
Entry.Playground.prototype.generatePictureView = function(a) {
  if ("workspace" == Entry.type) {
    var b = Entry.createElement("div", "entryAddPicture");
    b.addClass("entryPlaygroundAddPicture");
    b.bindOnClick(function(b) {
      Entry.dispatchEvent("openPictureManager");
    });
    var d = Entry.createElement("div", "entryAddPictureInner");
    d.addClass("entryPlaygroundAddPictureInner");
    d.innerHTML = Lang.Workspace.picture_add;
    b.appendChild(d);
    a.appendChild(b);
    b = Entry.createElement("ul", "entryPictureList");
    b.addClass("entryPlaygroundPictureList");
    $ && $(b).sortable({start:function(b, a) {
      a.item.data("start_pos", a.item.index());
    }, stop:function(b, a) {
      b = a.item.data("start_pos");
      a = a.item.index();
      Entry.playground.movePicture(b, a);
    }, axis:"y"});
    a.appendChild(b);
    this.pictureListView_ = b;
    b = Entry.createElement("div", "entryPainter");
    b.addClass("entryPlaygroundPainter");
    a.appendChild(b);
    this.painter = new Entry.Painter;
    this.painter.initialize(b);
  } else {
    "phone" == Entry.type && (b = Entry.createElement("div", "entryAddPicture"), b.addClass("entryPlaygroundAddPicturePhone"), b.bindOnClick(function(b) {
      Entry.dispatchEvent("openPictureManager");
    }), d = Entry.createElement("div", "entryAddPictureInner"), d.addClass("entryPlaygroundAddPictureInnerPhone"), d.innerHTML = Lang.Workspace.picture_add, b.appendChild(d), a.appendChild(b), b = Entry.createElement("ul", "entryPictureList"), b.addClass("entryPlaygroundPictureListPhone"), $ && $(b).sortable({start:function(b, a) {
      a.item.data("start_pos", a.item.index());
    }, stop:function(b, a) {
      b = a.item.data("start_pos");
      a = a.item.index();
      Entry.playground.movePicture(b, a);
    }, axis:"y"}), a.appendChild(b), this.pictureListView_ = b);
  }
};
Entry.Playground.prototype.generateTextView = function(a) {
  var b = Entry.createElement("div");
  a.appendChild(b);
  a = Entry.createElement("div");
  a.addClass("textProperties");
  b.appendChild(a);
  var d = Entry.createElement("div");
  d.addClass("entryTextFontSelect");
  a.appendChild(d);
  var c = Entry.createElement("select", "entryPainterAttrFontName");
  c.addClass("entryPlaygroundPainterAttrFontName", "entryTextFontSelecter");
  c.size = "1";
  c.onchange = function(b) {
    Entry.playground.object.entity.setFontType(b.target.value);
  };
  for (var e = 0;e < Entry.fonts.length;e++) {
    var f = Entry.fonts[e], g = Entry.createElement("option");
    g.value = f.family;
    g.innerHTML = f.name;
    c.appendChild(g);
  }
  this.fontName_ = c;
  d.appendChild(c);
  e = Entry.createElement("ul");
  e.addClass("entryPlayground_text_buttons");
  a.appendChild(e);
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignLeft");
  d.bindOnClick(function(b) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_LEFT);
  });
  e.appendChild(d);
  this.alignLeftBtn = d;
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignCenter");
  d.bindOnClick(function(b) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_CENTER);
  });
  e.appendChild(d);
  this.alignCenterBtn = d;
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignRight");
  d.bindOnClick(function(b) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_RIGHT);
  });
  e.appendChild(d);
  this.alignRightBtn = d;
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontBold() ? h.src = Entry.mediaFilePath + "text_button_bold_true.png" : h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  });
  var h = Entry.createElement("img", "entryPlaygroundText_boldImage");
  c.appendChild(h);
  h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    var b = !Entry.playground.object.entity.getUnderLine() || !1;
    k.src = Entry.mediaFilePath + "text_button_underline_" + b + ".png";
    Entry.playground.object.entity.setUnderLine(b);
  });
  var k = Entry.createElement("img", "entryPlaygroundText_underlineImage");
  c.appendChild(k);
  k.src = Entry.mediaFilePath + "text_button_underline_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontItalic() ? l.src = Entry.mediaFilePath + "text_button_italic_true.png" : l.src = Entry.mediaFilePath + "/text_button_italic_false.png";
  });
  var l = Entry.createElement("img", "entryPlaygroundText_italicImage");
  c.appendChild(l);
  l.src = Entry.mediaFilePath + "text_button_italic_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    var b = !Entry.playground.object.entity.getStrike() || !1;
    Entry.playground.object.entity.setStrike(b);
    m.src = Entry.mediaFilePath + "text_button_strike_" + b + ".png";
  });
  var m = Entry.createElement("img", "entryPlaygroundText_strikeImage");
  c.appendChild(m);
  m.src = Entry.mediaFilePath + "text_button_strike_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.toggleColourChooser("foreground");
  });
  c = Entry.createElement("img");
  d.appendChild(c);
  c.src = Entry.mediaFilePath + "text_button_color_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  e = Entry.createElement("a");
  d.appendChild(e);
  e.bindOnClick(function() {
    Entry.playground.toggleColourChooser("background");
  });
  d = Entry.createElement("img");
  e.appendChild(d);
  d.src = Entry.mediaFilePath + "text_button_background_false.png";
  e = Entry.createElement("div");
  e.addClass("entryPlayground_fgColorDiv");
  d = Entry.createElement("div");
  d.addClass("entryPlayground_bgColorDiv");
  a.appendChild(e);
  a.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundTextColoursWrapper");
  this.coloursWrapper = c;
  b.appendChild(c);
  a = Entry.getColourCodes();
  for (e = 0;e < a.length;e++) {
    d = Entry.createElement("div"), d.addClass("modal_colour"), d.setAttribute("colour", a[e]), d.style.backgroundColor = a[e], 0 === e && d.addClass("modalColourTrans"), d.bindOnClick(function(b) {
      Entry.playground.setTextColour(b.target.getAttribute("colour"));
    }), c.appendChild(d);
  }
  c.style.display = "none";
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundTextBackgroundsWrapper");
  this.backgroundsWrapper = c;
  b.appendChild(c);
  for (e = 0;e < a.length;e++) {
    d = Entry.createElement("div"), d.addClass("modal_colour"), d.setAttribute("colour", a[e]), d.style.backgroundColor = a[e], 0 === e && d.addClass("modalColourTrans"), d.bindOnClick(function(b) {
      Entry.playground.setBackgroundColour(b.target.getAttribute("colour"));
    }), c.appendChild(d);
  }
  c.style.display = "none";
  a = Entry.createElement("input");
  a.addClass("entryPlayground_textBox");
  a.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  a.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditInput = a;
  b.appendChild(a);
  a = Entry.createElement("textarea");
  a.addClass("entryPlayground_textArea");
  a.style.display = "none";
  a.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  a.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditArea = a;
  b.appendChild(a);
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundFontSizeWrapper");
  b.appendChild(a);
  this.fontSizeWrapper = a;
  var n = Entry.createElement("div");
  n.addClass("entryPlaygroundFontSizeSlider");
  a.appendChild(n);
  var q = Entry.createElement("div");
  q.addClass("entryPlaygroundFontSizeIndicator");
  n.appendChild(q);
  this.fontSizeIndiciator = q;
  var r = Entry.createElement("div");
  r.addClass("entryPlaygroundFontSizeKnob");
  n.appendChild(r);
  this.fontSizeKnob = r;
  e = Entry.createElement("div");
  e.addClass("entryPlaygroundFontSizeLabel");
  e.innerHTML = "\uae00\uc790 \ud06c\uae30";
  a.appendChild(e);
  var t = !1, u = 0;
  r.onmousedown = function(b) {
    t = !0;
    u = $(n).offset().left;
  };
  document.addEventListener("mousemove", function(b) {
    t && (b = b.pageX - u, b = Math.max(b, 5), b = Math.min(b, 88), r.style.left = b + "px", b /= .88, q.style.width = b + "%", Entry.playground.object.entity.setFontSize(b));
  });
  document.addEventListener("mouseup", function(b) {
    t = !1;
  });
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakWrapper");
  b.appendChild(a);
  b = Entry.createElement("hr");
  b.addClass("entryPlaygroundLinebreakHorizontal");
  a.appendChild(b);
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundLinebreakButtons");
  a.appendChild(b);
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!1);
    v.innerHTML = Lang.Menus.linebreak_off_desc_1;
    x.innerHTML = Lang.Menus.linebreak_off_desc_2;
    y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-off-true.png";
  b.appendChild(e);
  this.linebreakOffImage = e;
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!0);
    v.innerHTML = Lang.Menus.linebreak_on_desc_1;
    x.innerHTML = Lang.Menus.linebreak_on_desc_2;
    y.innerHTML = Lang.Menus.linebreak_on_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-on-false.png";
  b.appendChild(e);
  this.linebreakOnImage = e;
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundLinebreakDescription");
  a.appendChild(b);
  var v = Entry.createElement("p");
  v.innerHTML = Lang.Menus.linebreak_off_desc_1;
  b.appendChild(v);
  a = Entry.createElement("ul");
  b.appendChild(a);
  var x = Entry.createElement("li");
  x.innerHTML = Lang.Menus.linebreak_off_desc_2;
  a.appendChild(x);
  var y = Entry.createElement("li");
  y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  a.appendChild(y);
};
Entry.Playground.prototype.generateSoundView = function(a) {
  if ("workspace" == Entry.type) {
    var b = Entry.createElement("div", "entryAddSound");
    b.addClass("entryPlaygroundAddSound");
    b.bindOnClick(function(b) {
      Entry.dispatchEvent("openSoundManager");
    });
    var d = Entry.createElement("div", "entryAddSoundInner");
    d.addClass("entryPlaygroundAddSoundInner");
    d.innerHTML = Lang.Workspace.sound_add;
    b.appendChild(d);
    a.appendChild(b);
    b = Entry.createElement("ul", "entrySoundList");
    b.addClass("entryPlaygroundSoundList");
    $ && $(b).sortable({start:function(b, a) {
      a.item.data("start_pos", a.item.index());
    }, stop:function(b, a) {
      b = a.item.data("start_pos");
      a = a.item.index();
      Entry.playground.moveSound(b, a);
    }, axis:"y"});
    a.appendChild(b);
    this.soundListView_ = b;
  } else {
    "phone" == Entry.type && (b = Entry.createElement("div", "entryAddSound"), b.addClass("entryPlaygroundAddSoundPhone"), b.bindOnClick(function(b) {
      Entry.dispatchEvent("openSoundManager");
    }), d = Entry.createElement("div", "entryAddSoundInner"), d.addClass("entryPlaygroundAddSoundInnerPhone"), d.innerHTML = Lang.Workspace.sound_add, b.appendChild(d), a.appendChild(b), b = Entry.createElement("ul", "entrySoundList"), b.addClass("entryPlaygroundSoundListPhone"), $ && $(b).sortable({start:function(b, a) {
      a.item.data("start_pos", a.item.index());
    }, stop:function(b, a) {
      b = a.item.data("start_pos");
      a = a.item.index();
      Entry.playground.moveSound(b, a);
    }, axis:"y"}), a.appendChild(b), this.soundListView_ = b);
  }
};
Entry.Playground.prototype.injectObject = function(a) {
  if (!a) {
    this.changeViewMode("code"), this.object = null;
  } else {
    if (a !== this.object) {
      this.object && this.object.toggleInformation(!1);
      this.object = a;
      this.setMenu(a.objectType);
      this.injectCode();
      "sprite" == a.objectType && Entry.pictureEditable ? (this.tabViewElements.text && this.tabViewElements.text.addClass("entryRemove"), this.tabViewElements.picture && this.tabViewElements.picture.removeClass("entryRemove")) : "textBox" == a.objectType && (this.tabViewElements.picture && this.tabViewElements.picture.addClass("entryRemove"), this.tabViewElements.text && this.tabViewElements.text.removeClass("entryRemove"));
      var b = this.viewMode_;
      "default" == b ? this.changeViewMode("code") : "picture" != b && "text" != b || "textBox" != a.objectType ? "text" != b && "picture" != b || "sprite" != a.objectType ? "sound" == b && this.changeViewMode("sound") : this.changeViewMode("picture") : this.changeViewMode("text");
      this.reloadPlayground();
    }
  }
};
Entry.Playground.prototype.injectCode = function() {
  this.mainWorkspace.changeBoardCode(this.object.script);
};
Entry.Playground.prototype.adjustScroll = function(a, b) {
  var d = Blockly.mainWorkspace.scrollbar.vScroll;
  Blockly.mainWorkspace.scrollbar.hScroll.svgGroup_.setAttribute("opacity", "1");
  d.svgGroup_.setAttribute("opacity", "1");
  Blockly.mainWorkspace.getMetrics() && (Blockly.removeAllRanges(), d = Blockly.mainWorkspace.getMetrics(), a = Math.min(a, -d.contentLeft), b = Math.min(b, -d.contentTop), a = Math.max(a, d.viewWidth - d.contentLeft - d.contentWidth), b = Math.max(b, d.viewHeight - d.contentTop - d.contentHeight), Blockly.mainWorkspace.scrollbar.set(-a - d.contentLeft, -b - d.contentTop));
};
Entry.Playground.prototype.injectPicture = function() {
  var a = this.pictureListView_;
  if (a) {
    for (;a.hasChildNodes();) {
      a.removeChild(a.lastChild);
    }
    if (this.object) {
      for (var b = this.object.pictures, d = 0, c = b.length;d < c;d++) {
        var e = b[d].view;
        e || console.log(e);
        e.orderHolder.innerHTML = d + 1;
        a.appendChild(e);
      }
      this.selectPicture(this.object.selectedPicture);
    } else {
      Entry.dispatchEvent("pictureClear");
    }
  }
};
Entry.Playground.prototype.addPicture = function(a, b) {
  a = Entry.cloneSimpleObject(a);
  delete a.id;
  delete a.view;
  a = JSON.parse(JSON.stringify(a));
  a.id = Entry.generateHash();
  a.name = Entry.getOrderedName(a.name, this.object.pictures);
  this.generatePictureElement(a);
  this.object.addPicture(a);
  this.injectPicture();
  this.selectPicture(a);
};
Entry.Playground.prototype.setPicture = function(a) {
  var b = Entry.container.getPictureElement(a.id), d = $(b);
  if (b) {
    a.view = b;
    b.picture = a;
    b = d.find("#t_" + a.id)[0];
    if (a.fileurl) {
      b.style.backgroundImage = 'url("' + a.fileurl + '")';
    } else {
      var c = a.filename;
      b.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + c.substring(0, 2) + "/" + c.substring(2, 4) + "/thumb/" + c + '.png")';
    }
    d.find("#s_" + a.id)[0].innerHTML = a.dimension.width + " X " + a.dimension.height;
  }
  Entry.container.setPicture(a);
};
Entry.Playground.prototype.clonePicture = function(a) {
  a = Entry.playground.object.getPicture(a);
  this.addPicture(a, !0);
};
Entry.Playground.prototype.selectPicture = function(a) {
  for (var b = this.object.pictures, d = 0, c = b.length;d < c;d++) {
    var e = b[d];
    e.id === a.id ? e.view.addClass("entryPictureSelected") : e.view.removeClass("entryPictureSelected");
  }
  var f;
  a && a.id && (f = Entry.container.selectPicture(a.id));
  this.object.id === f && Entry.dispatchEvent("pictureSelected", a);
};
Entry.Playground.prototype.movePicture = function(a, b) {
  this.object.pictures.splice(b, 0, this.object.pictures.splice(a, 1)[0]);
  this.injectPicture();
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.injectText = function() {
  if (Entry.playground.object) {
    Entry.playground.textEditInput.value = Entry.playground.object.entity.getText();
    Entry.playground.textEditArea.value = Entry.playground.object.entity.getText();
    Entry.playground.fontName_.value = Entry.playground.object.entity.getFontName();
    if (Entry.playground.object.entity.font) {
      var a = -1 < Entry.playground.object.entity.font.indexOf("bold") || !1;
      $("#entryPlaygroundText_boldImage").attr("src", Entry.mediaFilePath + "text_button_bold_" + a + ".png");
      a = -1 < Entry.playground.object.entity.font.indexOf("italic") || !1;
      $("#entryPlaygroundText_italicImage").attr("src", Entry.mediaFilePath + "text_button_italic_" + a + ".png");
    }
    a = Entry.playground.object.entity.getUnderLine() || !1;
    $("#entryPlaygroundText_underlineImage").attr("src", Entry.mediaFilePath + "text_button_underline_" + a + ".png");
    a = Entry.playground.object.entity.getStrike() || !1;
    $("#entryPlaygroundText_strikeImage").attr("src", Entry.mediaFilePath + "text_button_strike_" + a + ".png");
    $(".entryPlayground_fgColorDiv").css("backgroundColor", Entry.playground.object.entity.colour);
    $(".entryPlayground_bgColorDiv").css("backgroundColor", Entry.playground.object.entity.bgColour);
    Entry.playground.toggleLineBreak(Entry.playground.object.entity.getLineBreak());
    Entry.playground.object.entity.getLineBreak() && ($(".entryPlaygroundLinebreakDescription > p").html(Lang.Menus.linebreak_on_desc_1), $(".entryPlaygroundLinebreakDescription > ul > li").eq(0).html(Lang.Menus.linebreak_on_desc_2), $(".entryPlaygroundLinebreakDescription > ul > li").eq(1).html(Lang.Menus.linebreak_on_desc_3));
    Entry.playground.setFontAlign(Entry.playground.object.entity.getTextAlign());
    a = Entry.playground.object.entity.getFontSize();
    Entry.playground.fontSizeIndiciator.style.width = a + "%";
    Entry.playground.fontSizeKnob.style.left = .88 * a + "px";
  }
};
Entry.Playground.prototype.injectSound = function() {
  var a = this.soundListView_;
  if (a) {
    for (;a.hasChildNodes();) {
      a.removeChild(a.lastChild);
    }
    if (this.object) {
      for (var b = this.object.sounds, d = 0, c = b.length;d < c;d++) {
        var e = b[d].view;
        e.orderHolder.innerHTML = d + 1;
        a.appendChild(e);
      }
    }
  }
};
Entry.Playground.prototype.moveSound = function(a, b) {
  this.object.sounds.splice(b, 0, this.object.sounds.splice(a, 1)[0]);
  this.updateListViewOrder("sound");
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.addSound = function(a, b) {
  a = Entry.cloneSimpleObject(a);
  delete a.view;
  delete a.id;
  a = JSON.parse(JSON.stringify(a));
  a.id = Entry.generateHash();
  a.name = Entry.getOrderedName(a.name, this.object.sounds);
  this.generateSoundElement(a);
  this.object.addSound(a);
  this.injectSound();
};
Entry.Playground.prototype.changeViewMode = function(a) {
  for (var b in this.tabViewElements) {
    this.tabViewElements[b].removeClass("entryTabSelected");
  }
  "default" != a && this.tabViewElements[a].addClass("entryTabSelected");
  if ("variable" != a) {
    var d = this.view_.children;
    for (b = 0;b < d.length;b++) {
      var c = d[b];
      -1 < c.id.toUpperCase().indexOf(a.toUpperCase()) ? c.removeClass("entryRemove") : c.addClass("entryRemove");
    }
    if ("picture" == a && (!this.pictureView_.object || this.pictureView_.object != this.object)) {
      this.pictureView_.object = this.object, this.injectPicture();
    } else {
      if ("sound" == a && (!this.soundView_.object || this.soundView_.object != this.object)) {
        this.soundView_.object = this.object, this.injectSound();
      } else {
        if ("text" == a && "textBox" == this.object.objectType || this.textView_.object != this.object) {
          this.textView_.object = this.object, this.injectText();
        }
      }
    }
    "code" == a && this.resizeHandle_ && this.resizeHandle_.removeClass("entryRemove");
    Entry.engine.isState("run") && this.curtainView_.removeClass("entryRemove");
    this.viewMode_ = a;
    this.toggleOffVariableView();
  }
};
Entry.Playground.prototype.createVariableView = function() {
  var a = Entry.createElement("div");
  Entry.type && "workspace" != Entry.type ? "phone" == Entry.type && a.addClass("entryVariablePanelPhone") : a.addClass("entryVariablePanelWorkspace");
  this.variableViewWrapper_ = a;
  Entry.variableContainer.createDom(a);
  return a;
};
Entry.Playground.prototype.toggleOnVariableView = function() {
  Entry.playground.changeViewMode("code");
  this.hideBlockMenu();
  Entry.variableContainer.updateList();
  this.variableView_.removeClass("entryRemove");
  this.resizeHandle_.removeClass("entryRemove");
};
Entry.Playground.prototype.toggleOffVariableView = function() {
  this.showBlockMenu();
  this.variableView_.addClass("entryRemove");
};
Entry.Playground.prototype.editBlock = function() {
  var a = Entry.playground;
  Entry.stateManager && Entry.stateManager.addCommand("edit block", a, a.restoreBlock, a.object, a.object.getScriptText());
};
Entry.Playground.prototype.mouseupBlock = function() {
  if (Entry.reporter) {
    var a = Entry.playground, b = a.object;
    Entry.reporter.report(new Entry.State("edit block mouseup", a, a.restoreBlock, b, b.getScriptText()));
  }
};
Entry.Playground.prototype.restoreBlock = function(a, b) {
  Entry.container.selectObject(a.id);
  Entry.stateManager && Entry.stateManager.addCommand("restore block", this, this.restoreBlock, this.object, this.object.getScriptText());
  Blockly.Xml.textToDom(b);
};
Entry.Playground.prototype.setMenu = function(a) {
  if (this.currentObjectType != a) {
    var b = this.blockMenu;
    b.unbanClass(this.currentObjectType);
    b.banClass(a);
    b.setMenu();
    b.selectMenu(0, !0);
    this.currentObjectType = a;
  }
};
Entry.Playground.prototype.hideTabs = function() {
  var a = ["picture", "text", "sound", "variable"], b;
  for (b in a) {
    this.hideTab([a[b]]);
  }
};
Entry.Playground.prototype.hideTab = function(a) {
  this.tabViewElements[a] && (this.tabViewElements[a].addClass("hideTab"), this.tabViewElements[a].removeClass("showTab"));
};
Entry.Playground.prototype.showTabs = function() {
  var a = ["picture", "text", "sound", "variable"], b;
  for (b in a) {
    this.showTab(a[b]);
  }
};
Entry.Playground.prototype.showTab = function(a) {
  this.tabViewElements[a] && (this.tabViewElements[a].addClass("showTab"), this.tabViewElements[a].removeClass("hideTab"));
};
Entry.Playground.prototype.initializeResizeHandle = function(a) {
  a.onmousedown = function(b) {
    Entry.playground.resizing = !0;
    Entry.documentMousemove && (Entry.playground.resizeEvent = Entry.documentMousemove.attach(this, function(b) {
      Entry.playground.resizing && Entry.resizeElement({menuWidth:b.clientX - Entry.interfaceState.canvasWidth});
    }));
  };
  document.addEventListener("mouseup", function(b) {
    if (b = Entry.playground.resizeEvent) {
      Entry.playground.resizing = !1, Entry.documentMousemove.detach(b), delete Entry.playground.resizeEvent;
    }
  });
};
Entry.Playground.prototype.reloadPlayground = function() {
  var a = this.mainWorkspace;
  a && (a.getBlockMenu().reDraw(), this.object && this.object.script.view.reDraw());
};
Entry.Playground.prototype.flushPlayground = function() {
  this.object = null;
  if (Entry.playground && Entry.playground.view_) {
    this.injectPicture();
    this.injectSound();
    var a = Entry.playground.mainWorkspace.getBoard();
    a.clear();
    a.changeCode(null);
  }
};
Entry.Playground.prototype.refreshPlayground = function() {
  Entry.playground && Entry.playground.view_ && (this.injectPicture(), this.injectSound());
};
Entry.Playground.prototype.updateListViewOrder = function(a) {
  a = "picture" == a ? this.pictureListView_.childNodes : this.soundListView_.childNodes;
  for (var b = 0, d = a.length;b < d;b++) {
    a[b].orderHolder.innerHTML = b + 1;
  }
};
Entry.Playground.prototype.generatePictureElement = function(a) {
  function b() {
    if ("" === this.value.trim()) {
      Entry.deAttachEventListener(this, "blur", b), alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus(), Entry.attachEventListener(this, "blur", b);
    } else {
      for (var a = $(".entryPlaygroundPictureName"), d = 0;d < a.length;d++) {
        if (a.eq(d).val() == f.value && a[d] != this) {
          Entry.deAttachEventListener(this, "blur", b);
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          Entry.attachEventListener(this, "blur", b);
          return;
        }
      }
      this.picture.name = this.value;
      Entry.playground.reloadPlayground();
      Entry.dispatchEvent("pictureNameChanged", this.picture);
    }
  }
  var d = Entry.createElement("li", a.id);
  a.view = d;
  d.addClass("entryPlaygroundPictureElement");
  d.picture = a;
  d.bindOnClick(function(b) {
    Entry.playground.selectPicture(this.picture);
  });
  Entry.Utils.disableContextmenu(a.view);
  $(a.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      f.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.clonePicture(a.id);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removePicture(a.id) ? (Entry.removeElement(d), Entry.toast.success(Lang.Workspace.shape_remove_ok, a.name + " " + Lang.Workspace.shape_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.shape_remove_fail, Lang.Workspace.shape_remove_fail_msg);
    }}, {divider:!0}, {text:Lang.Workspace.context_download, callback:function() {
      a.fileurl ? window.open(a.fileurl) : window.open("/api/sprite/download/image/" + encodeURIComponent(a.filename) + "/" + encodeURIComponent(a.name) + ".png");
    }}], "workspace-contextmenu");
  });
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundPictureOrder");
  d.orderHolder = c;
  d.appendChild(c);
  c = Entry.createElement("div", "t_" + a.id);
  c.addClass("entryPlaygroundPictureThumbnail");
  if (a.fileurl) {
    c.style.backgroundImage = 'url("' + a.fileurl + '")';
  } else {
    var e = a.filename;
    c.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + e.substring(0, 2) + "/" + e.substring(2, 4) + "/thumb/" + e + '.png")';
  }
  d.appendChild(c);
  var f = Entry.createElement("input");
  f.addClass("entryPlaygroundPictureName");
  f.addClass("entryEllipsis");
  f.picture = a;
  f.value = a.name;
  Entry.attachEventListener(f, "blur", b);
  f.onkeypress = function(b) {
    13 == b.keyCode && this.blur();
  };
  d.appendChild(f);
  c = Entry.createElement("div", "s_" + a.id);
  c.addClass("entryPlaygroundPictureSize");
  c.innerHTML = a.dimension.width + " X " + a.dimension.height;
  d.appendChild(c);
};
Entry.Playground.prototype.generateSoundElement = function(a) {
  var b = Entry.createElement("sound", a.id);
  a.view = b;
  b.addClass("entryPlaygroundSoundElement");
  b.sound = a;
  Entry.Utils.disableContextmenu(a.view);
  $(a.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      g.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.addSound(a, !0);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removeSound(a.id) ? (Entry.removeElement(b), Entry.toast.success(Lang.Workspace.sound_remove_ok, a.name + " " + Lang.Workspace.sound_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.sound_remove_fail, "");
      Entry.removeElement(b);
    }}], "workspace-contextmenu");
  });
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundOrder");
  b.orderHolder = d;
  b.appendChild(d);
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundThumbnail");
  c.addClass("entryPlaygroundSoundPlay");
  var e = !1, f;
  c.addEventListener("click", function() {
    e ? (e = !1, c.removeClass("entryPlaygroundSoundStop"), c.addClass("entryPlaygroundSoundPlay"), f.stop()) : (e = !0, c.removeClass("entryPlaygroundSoundPlay"), c.addClass("entryPlaygroundSoundStop"), f = createjs.Sound.play(a.id), f.addEventListener("complete", function(b) {
      c.removeClass("entryPlaygroundSoundStop");
      c.addClass("entryPlaygroundSoundPlay");
      e = !1;
    }), f.addEventListener("loop", function(b) {
    }), f.addEventListener("failed", function(b) {
    }));
  });
  b.appendChild(c);
  var g = Entry.createElement("input");
  g.addClass("entryPlaygroundSoundName");
  g.sound = a;
  g.value = a.name;
  var h = document.getElementsByClassName("entryPlaygroundSoundName");
  g.onblur = function() {
    if ("" === this.value) {
      alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus();
    } else {
      for (var b = 0, a = 0;a < h.length;a++) {
        if (h[a].value == g.value && (b += 1, 1 < b)) {
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          return;
        }
      }
      this.sound.name = this.value;
    }
  };
  g.onkeypress = function(b) {
    13 == b.keyCode && this.blur();
  };
  b.appendChild(g);
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundLength");
  d.innerHTML = a.duration + " \ucd08";
  b.appendChild(d);
};
Entry.Playground.prototype.toggleColourChooser = function(a) {
  "foreground" === a ? "none" === this.coloursWrapper.style.display ? (this.coloursWrapper.style.display = "block", this.backgroundsWrapper.style.display = "none") : this.coloursWrapper.style.display = "none" : "background" === a && ("none" === this.backgroundsWrapper.style.display ? (this.backgroundsWrapper.style.display = "block", this.coloursWrapper.style.display = "none") : this.backgroundsWrapper.style.display = "none");
};
Entry.Playground.prototype.setTextColour = function(a) {
  Entry.playground.object.entity.setColour(a);
  Entry.playground.toggleColourChooser("foreground");
  $(".entryPlayground_fgColorDiv").css("backgroundColor", a);
};
Entry.Playground.prototype.setBackgroundColour = function(a) {
  Entry.playground.object.entity.setBGColour(a);
  Entry.playground.toggleColourChooser("background");
  $(".entryPlayground_bgColorDiv").css("backgroundColor", a);
};
Entry.Playground.prototype.isTextBGMode = function() {
  return this.isTextBGMode_;
};
Entry.Playground.prototype.checkVariables = function() {
  Entry.forEBS || (Entry.variableContainer.lists_.length ? this.blockMenu.unbanClass("listNotExist") : this.blockMenu.banClass("listNotExist"), Entry.variableContainer.variables_.length ? this.blockMenu.unbanClass("variableNotExist") : this.blockMenu.banClass("variableNotExist"));
};
Entry.Playground.prototype.getViewMode = function() {
  return this.viewMode_;
};
Entry.Playground.prototype.updateHW = function() {
  var a = Entry.playground.mainWorkspace.blockMenu;
  if (a) {
    var b = Entry.hw;
    b && b.connected ? (a.unbanClass("arduinoConnected", !0), a.banClass("arduinoDisconnected", !0), b.banHW(), b.hwModule && a.unbanClass(b.hwModule.name)) : (a.banClass("arduinoConnected", !0), a.unbanClass("arduinoDisconnected", !0), Entry.hw.banHW());
    a.reDraw();
  }
};
Entry.Playground.prototype.toggleLineBreak = function(a) {
  this.object && "textBox" == this.object.objectType && (a ? (Entry.playground.object.entity.setLineBreak(!0), $(".entryPlayground_textArea").css("display", "block"), $(".entryPlayground_textBox").css("display", "none"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-false.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-true.png", this.fontSizeWrapper.removeClass("entryHide")) : (Entry.playground.object.entity.setLineBreak(!1), $(".entryPlayground_textArea").css("display", 
  "none"), $(".entryPlayground_textBox").css("display", "block"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-true.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-false.png", this.fontSizeWrapper.addClass("entryHide")));
};
Entry.Playground.prototype.setFontAlign = function(a) {
  if ("textBox" == this.object.objectType) {
    this.alignLeftBtn.removeClass("toggle");
    this.alignCenterBtn.removeClass("toggle");
    this.alignRightBtn.removeClass("toggle");
    switch(a) {
      case Entry.TEXT_ALIGN_LEFT:
        this.alignLeftBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_CENTER:
        this.alignCenterBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_RIGHT:
        this.alignRightBtn.addClass("toggle");
    }
    this.object.entity.setTextAlign(a);
  }
};
Entry.Playground.prototype.hideBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().hide();
};
Entry.Playground.prototype.showBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().show();
};
Entry.Popup = function() {
  Entry.assert(!window.popup, "Popup exist");
  this.body_ = Entry.createElement("div");
  this.body_.addClass("entryPopup");
  this.body_.bindOnClick(function(a) {
    a.target == this && this.popup.remove();
  });
  this.body_.popup = this;
  document.body.appendChild(this.body_);
  this.window_ = Entry.createElement("div");
  this.window_.addClass("entryPopupWindow");
  this.window_.bindOnClick(function() {
  });
  Entry.addEventListener("windowResized", this.resize);
  window.popup = this;
  this.resize();
  this.body_.appendChild(this.window_);
};
Entry.Popup.prototype.remove = function() {
  for (;this.window_.hasChildNodes();) {
    "workspace" == Entry.type ? Entry.view_.insertBefore(this.window_.firstChild, Entry.container.view_) : Entry.view_.insertBefore(this.window_.lastChild, Entry.view_.firstChild);
  }
  $("body").css("overflow", "auto");
  Entry.removeElement(this.body_);
  window.popup = null;
  Entry.removeEventListener("windowResized", this.resize);
  Entry.engine.popup = null;
};
Entry.Popup.prototype.resize = function(a) {
  a = window.popup.window_;
  var b = .9 * window.innerWidth, d = .9 * window.innerHeight - 35;
  9 * b <= 16 * d ? d = b / 16 * 9 + 35 : (b = 16 * d / 9, d += 35);
  a.style.width = String(b) + "px";
  a.style.height = String(d) + "px";
};
Entry.popupHelper = function(a) {
  this.popupList = {};
  this.nowContent;
  a && (window.popupHelper = null);
  Entry.assert(!window.popupHelper, "Popup exist");
  var b = ["confirm", "spinner"], d = ["entryPopupHelperTopSpan", "entryPopupHelperBottomSpan", "entryPopupHelperLeftSpan", "entryPopupHelperRightSpan"];
  this.body_ = Entry.Dom("div", {classes:["entryPopup", "hiddenPopup", "popupHelper"]});
  var c = this;
  this.body_.bindOnClick(function(a) {
    if (!(c.nowContent && -1 < b.indexOf(c.nowContent.prop("type")))) {
      var f = $(a.target);
      d.forEach(function(b) {
        f.hasClass(b) && this.popup.hide();
      }.bind(this));
      a.target == this && this.popup.hide();
    }
  });
  window.popupHelper = this;
  this.body_.prop("popup", this);
  Entry.Dom("div", {class:"entryPopupHelperTopSpan", parent:this.body_});
  a = Entry.Dom("div", {class:"entryPopupHelperMiddleSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperBottomSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperLeftSpan", parent:a});
  this.window_ = Entry.Dom("div", {class:"entryPopupHelperWindow", parent:a});
  Entry.Dom("div", {class:"entryPopupHelperRightSpan", parent:a});
  $("body").append(this.body_);
};
Entry.popupHelper.prototype.clearPopup = function() {
  for (var a = this.popupWrapper_.children.length - 1;2 < a;a--) {
    this.popupWrapper_.removeChild(this.popupWrapper_.children[a]);
  }
};
Entry.popupHelper.prototype.addPopup = function(a, b) {
  var d = Entry.Dom("div"), c = Entry.Dom("div", {class:"entryPopupHelperCloseButton"});
  c.bindOnClick(function() {
    b.closeEvent ? b.closeEvent(this) : this.hide();
  }.bind(this));
  var e = Entry.Dom("div", {class:"entryPopupHelperWrapper"});
  e.append(c);
  b.title && (c = Entry.Dom("div", {class:"entryPopupHelperTitle"}), e.append(c), c.text(b.title));
  d.addClass(a);
  d.append(e);
  d.popupWrapper_ = e;
  d.prop("type", b.type);
  "function" === typeof b.setPopupLayout && b.setPopupLayout(d);
  this.popupList[a] = d;
};
Entry.popupHelper.prototype.hasPopup = function(a) {
  return !!this.popupList[a];
};
Entry.popupHelper.prototype.setPopup = function(a) {
};
Entry.popupHelper.prototype.remove = function(a) {
  0 < this.window_.children().length && this.window_.children().remove();
  this.window_.remove();
  delete this.popupList[a];
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
};
Entry.popupHelper.prototype.resize = function(a) {
};
Entry.popupHelper.prototype.show = function(a) {
  0 < this.window_.children().length && this.window_.children().detach();
  this.window_.append(this.popupList[a]);
  this.nowContent = this.popupList[a];
  this.body_.removeClass("hiddenPopup");
};
Entry.popupHelper.prototype.hide = function() {
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
};
Entry.getStartProject = function(a) {
  return {category:"\uae30\ud0c0", scenes:[{name:"\uc7a5\uba74 1", id:"7dwq"}], variables:[{name:"\ucd08\uc2dc\uacc4", id:"brih", visible:!1, value:"0", variableType:"timer", x:150, y:-70, array:[], object:null, isCloud:!1}, {name:"\ub300\ub2f5", id:"1vu8", visible:!1, value:"0", variableType:"answer", x:150, y:-100, array:[], object:null, isCloud:!1}], objects:[{id:"7y0y", name:"\uc5d4\ud2b8\ub9ac\ubd07", script:[[{type:"when_run_button_click", x:40, y:50}, {type:"repeat_basic", statements:[[{type:"move_direction"}]]}]], 
  selectedPictureId:"vx80", objectType:"sprite", rotateMethod:"free", scene:"7dwq", sprite:{sounds:[{duration:1.3, ext:".mp3", id:"8el5", fileurl:a + "media/bark.mp3", name:"\uac15\uc544\uc9c0 \uc9d6\ub294\uc18c\ub9ac"}], pictures:[{id:"vx80", fileurl:a + "media/entrybot1.png", name:Lang.Blocks.walking_entryBot + "1", scale:100, dimension:{width:284, height:350}}, {id:"4t48", fileurl:a + "media/entrybot2.png", name:Lang.Blocks.walking_entryBot + "2", scale:100, dimension:{width:284, height:350}}]}, 
  entity:{x:0, y:0, regX:142, regY:175, scaleX:.3154574132492113, scaleY:.3154574132492113, rotation:0, direction:90, width:284, height:350, visible:!0}, lock:!1, active:!0}], speed:60};
};
Entry.Reporter = function(a) {
  this.projectId = this.userId = null;
  this.isRealTime = a;
  this.activities = [];
};
Entry.Reporter.prototype.start = function(a, b, d) {
  this.isRealTime && (-1 < window.location.href.indexOf("localhost") ? this.io = io("localhost:7000") : this.io = io("play04.play-entry.com:7000"), this.io.emit("activity", {message:"start", userId:b, projectId:a, time:d}));
  this.userId = b;
  this.projectId = a;
};
Entry.Reporter.prototype.report = function(a) {
  if (!this.isRealTime || this.io) {
    var b = [], d;
    for (d in a.params) {
      var c = a.params[d];
      "object" !== typeof c ? b.push(c) : c.id && b.push(c.id);
    }
    a = {message:a.message, userId:this.userId, projectId:this.projectId, time:a.time, params:b};
    this.isRealTime ? this.io.emit("activity", a) : this.activities.push(a);
  }
};
Entry.Scene = function() {
  var a = this;
  this.scenes_ = [];
  this.selectedScene = null;
  this.maxCount = 20;
  $(window).on("resize", function(b) {
    a.resize();
  });
};
Entry.Scene.viewBasicWidth = 70;
Entry.Scene.prototype.generateView = function(a, b) {
  var d = this;
  this.view_ = a;
  this.view_.addClass("entryScene");
  b && "workspace" != b || (this.view_.addClass("entrySceneWorkspace"), $(this.view_).on("mousedown", function(b) {
    var a = $(this).offset(), f = $(window), g = b.pageX - a.left + f.scrollLeft();
    b = b.pageY - a.top + f.scrollTop();
    b = 40 - b;
    a = -40 / 55;
    f = $(d.selectedScene.view).find(".entrySceneRemoveButtonCoverWorkspace").offset().left;
    !(g < f || g > f + 55) && b > 40 + a * (g - f) && (g = d.getNextScene()) && (g = $(g.view), $(document).trigger("mouseup"), g.trigger("mousedown"));
  }), a = Entry.createElement("ul"), a.addClass("entrySceneListWorkspace"), Entry.sceneEditable && $ && $(a).sortable({start:function(b, a) {
    a.item.data("start_pos", a.item.index());
    $(a.item[0]).clone(!0);
  }, stop:function(b, a) {
    b = a.item.data("start_pos");
    a = a.item.index();
    Entry.scene.moveScene(b, a);
  }, axis:"x", tolerance:"pointer"}), this.view_.appendChild(a), this.listView_ = a, Entry.sceneEditable && (a = Entry.createElement("span"), a.addClass("entrySceneElementWorkspace"), a.addClass("entrySceneAddButtonWorkspace"), a.bindOnClick(function(b) {
    Entry.engine.isState("run") || Entry.scene.addScene();
  }), this.view_.appendChild(a), this.addButton_ = a));
};
Entry.Scene.prototype.generateElement = function(a) {
  var b = this, d = Entry.createElement("li", a.id);
  d.addClass("entrySceneElementWorkspace");
  d.addClass("entrySceneButtonWorkspace");
  d.addClass("minValue");
  $(d).on("mousedown", function(b) {
    Entry.engine.isState("run") ? b.preventDefault() : Entry.scene.selectScene(a);
  });
  var c = Entry.createElement("input");
  c.addClass("entrySceneFieldWorkspace");
  c.value = a.name;
  Entry.sceneEditable || (c.disabled = "disabled");
  var e = Entry.createElement("span");
  e.addClass("entrySceneLeftWorkspace");
  d.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entrySceneInputCover");
  f.style.width = Entry.computeInputWidth(a.name);
  d.appendChild(f);
  a.inputWrapper = f;
  c.onkeyup = function(d) {
    d = d.keyCode;
    Entry.isArrowOrBackspace(d) || (a.name = this.value, f.style.width = Entry.computeInputWidth(a.name), b.resize(), 13 == d && this.blur(), 9 < this.value.length && (this.value = this.value.substring(0, 10), this.blur()));
  };
  c.onblur = function(b) {
    c.value = this.value;
    a.name = this.value;
    f.style.width = Entry.computeInputWidth(a.name);
  };
  f.appendChild(c);
  e = Entry.createElement("span");
  e.addClass("entrySceneRemoveButtonCoverWorkspace");
  d.appendChild(e);
  if (Entry.sceneEditable) {
    var g = Entry.createElement("button");
    g.addClass("entrySceneRemoveButtonWorkspace");
    g.innerHTML = "x";
    g.scene = a;
    g.bindOnClick(function(b) {
      b.stopPropagation();
      Entry.engine.isState("run") || confirm(Lang.Workspace.will_you_delete_scene) && Entry.scene.removeScene(this.scene);
    });
    e.appendChild(g);
  }
  Entry.Utils.disableContextmenu(d);
  $(d).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.duplicate_scene, callback:function() {
      Entry.scene.cloneScene(a);
    }}], "workspace-contextmenu");
  });
  return a.view = d;
};
Entry.Scene.prototype.updateView = function() {
  if (!Entry.type || "workspace" == Entry.type) {
    for (var a = this.listView_;a.hasChildNodes();) {
      a.lastChild.removeClass("selectedScene"), a.removeChild(a.lastChild);
    }
    for (var b in this.getScenes()) {
      var d = this.scenes_[b];
      a.appendChild(d.view);
      this.selectedScene.id == d.id && d.view.addClass("selectedScene");
    }
    this.addButton_ && (this.getScenes().length < this.maxCount ? this.addButton_.removeClass("entryRemove") : this.addButton_.addClass("entryRemove"));
  }
  this.resize();
};
Entry.Scene.prototype.addScenes = function(a) {
  if ((this.scenes_ = a) && 0 !== a.length) {
    for (var b = 0, d = a.length;b < d;b++) {
      this.generateElement(a[b]);
    }
  } else {
    this.scenes_ = [], this.scenes_.push(this.createScene());
  }
  this.selectScene(this.getScenes()[0]);
  this.updateView();
};
Entry.Scene.prototype.addScene = function(a, b) {
  void 0 === a && (a = this.createScene());
  a.view || this.generateElement(a);
  b || "number" == typeof b ? this.getScenes().splice(b, 0, a) : this.getScenes().push(a);
  Entry.stage.objectContainers.push(Entry.stage.createObjectContainer(a));
  Entry.playground.flushPlayground();
  this.selectScene(a);
  this.updateView();
  return a;
};
Entry.Scene.prototype.removeScene = function(a) {
  if (1 >= this.getScenes().length) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_delete_error, !1);
  } else {
    var b = this.getScenes().indexOf(this.getSceneById(a.id));
    this.getScenes().splice(b, 1);
    this.selectScene();
    for (var b = Entry.container.getSceneObjects(a), d = 0;d < b.length;d++) {
      Entry.container.removeObject(b[d]);
    }
    Entry.stage.removeObjectContainer(a);
    this.updateView();
  }
};
Entry.Scene.prototype.selectScene = function(a) {
  a = a || this.getScenes()[0];
  this.selectedScene && this.selectedScene.id == a.id || (Entry.engine.isState("run") && Entry.container.resetSceneDuringRun(), this.selectedScene = a, Entry.container.setCurrentObjects(), Entry.stage.objectContainers && 0 !== Entry.stage.objectContainers.length && Entry.stage.selectObjectContainer(a), (a = Entry.container.getCurrentObjects()[0]) && "minimize" != Entry.type ? (Entry.container.selectObject(a.id), Entry.playground.refreshPlayground()) : (Entry.stage.selectObject(null), Entry.playground.flushPlayground(), 
  Entry.variableContainer.updateList()), Entry.container.listView_ || Entry.stage.sortZorder(), Entry.container.updateListView(), this.updateView());
};
Entry.Scene.prototype.toJSON = function() {
  for (var a = [], b = this.getScenes().length, d = 0;d < b;d++) {
    var c = this.getScenes()[d], e = c.view, f = c.inputWrapper;
    delete c.view;
    delete c.inputWrapper;
    a.push(JSON.parse(JSON.stringify(c)));
    c.view = e;
    c.inputWrapper = f;
  }
  return a;
};
Entry.Scene.prototype.moveScene = function(a, b) {
  this.getScenes().splice(b, 0, this.getScenes().splice(a, 1)[0]);
  Entry.container.updateObjectsOrder();
  Entry.stage.sortZorder();
};
Entry.Scene.prototype.getSceneById = function(a) {
  for (var b = this.getScenes(), d = 0;d < b.length;d++) {
    if (b[d].id == a) {
      return b[d];
    }
  }
  return !1;
};
Entry.Scene.prototype.getScenes = function() {
  return this.scenes_;
};
Entry.Scene.prototype.takeStartSceneSnapshot = function() {
  this.sceneBeforeRun = this.selectedScene;
};
Entry.Scene.prototype.loadStartSceneSnapshot = function() {
  this.selectScene(this.sceneBeforeRun);
  this.sceneBeforeRun = null;
};
Entry.Scene.prototype.createScene = function() {
  var a = {name:Lang.Blocks.SCENE + " " + (this.getScenes().length + 1), id:Entry.generateHash()};
  this.generateElement(a);
  return a;
};
Entry.Scene.prototype.cloneScene = function(a) {
  if (this.scenes_.length >= this.maxCount) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_add_error, !1);
  } else {
    var b = {name:a.name + Lang.Workspace.replica_of_object, id:Entry.generateHash()};
    this.generateElement(b);
    this.addScene(b);
    a = Entry.container.getSceneObjects(a);
    for (var d = a.length - 1;0 <= d;d--) {
      Entry.container.addCloneObject(a[d], b.id);
    }
  }
};
Entry.Scene.prototype.resize = function() {
  var a = this.getScenes(), b = this.selectedScene, d = a[0];
  if (0 !== a.length && d) {
    var c = $(d.view).offset().left, d = parseFloat($(b.view).css("margin-left")), e = $(this.view_).width() - c, f = 0, g;
    for (g in a) {
      var c = a[g], h = c.view;
      h.addClass("minValue");
      $(h).removeProp("style");
      $(c.inputWrapper).width(Entry.computeInputWidth(c.name));
      h = $(h);
      f = f + h.width() + d;
    }
    if (f > e) {
      for (g in e -= $(b.view).width(), d = e / (a.length - 1) - (Entry.Scene.viewBasicWidth + d), a) {
        c = a[g], b.id != c.id ? (c.view.removeClass("minValue"), $(c.inputWrapper).width(d)) : c.view.addClass("minValue");
      }
    }
  }
};
Entry.Scene.prototype.getNextScene = function() {
  var a = this.getScenes();
  return a[a.indexOf(this.selectedScene) + 1];
};
Entry.Script = function(a) {
  this.entity = a;
};
p = Entry.Script.prototype;
p.init = function(a, b, d) {
  Entry.assert("BLOCK" == a.tagName.toUpperCase(), a.tagName);
  this.type = a.getAttribute("type");
  this.id = Number(a.getAttribute("id"));
  a.getElementsByTagName("mutation").length && a.getElementsByTagName("mutation")[0].hasAttribute("hashid") && (this.hashId = a.childNodes[0].getAttribute("hashid"));
  "REPEAT" == this.type.substr(0, 6).toUpperCase() && (this.isRepeat = !0);
  b instanceof Entry.Script && (this.previousScript = b, b.parentScript && (this.parentScript = b.parentScript));
  d instanceof Entry.Script && (this.parentScript = d);
  a = a.childNodes;
  for (b = 0;b < a.length;b++) {
    if (d = a[b], "NEXT" == d.tagName.toUpperCase()) {
      this.nextScript = new Entry.Script(this.entity), this.register && (this.nextScript.register = this.register), this.nextScript.init(a[b].childNodes[0], this);
    } else {
      if ("VALUE" == d.tagName.toUpperCase()) {
        this.values || (this.values = {});
        var c = new Entry.Script(this.entity);
        this.register && (c.register = this.register);
        c.init(d.childNodes[0]);
        this.values[d.getAttribute("name")] = c;
      } else {
        "FIELD" == d.tagName.toUpperCase() ? (this.fields || (this.fields = {}), this.fields[d.getAttribute("name")] = d.textContent) : "STATEMENT" == d.tagName.toUpperCase() && (this.statements || (this.statements = {}), c = new Entry.Script(this.entity), this.register && (c.register = this.register), c.init(d.childNodes[0], null, this), c.key = d.getAttribute("name"), this.statements[d.getAttribute("name")] = c);
      }
    }
  }
};
p.clone = function(a, b) {
  var d = new Entry.Script(a);
  d.id = this.id;
  d.type = this.type;
  d.isRepeat = this.isRepeat;
  if (this.parentScript && !this.previousScript && 2 != b) {
    d.parentScript = this.parentScript.clone(a);
    for (var c = d.parentScript.statements[this.key] = d;c.nextScript;) {
      c = c.nextScript, c.parentScript = d.parentScript;
    }
  }
  this.nextScript && 1 != b && (d.nextScript = this.nextScript.clone(a, 0), d.nextScript.previousScript = this);
  this.previousScript && 0 !== b && (d.previousScript = this.previousScript.clone(a, 1), d.previousScript.previousScript = this);
  if (this.fields) {
    d.fields = {};
    for (var e in this.fields) {
      d.fields[e] = this.fields[e];
    }
  }
  if (this.values) {
    for (e in d.values = {}, this.values) {
      d.values[e] = this.values[e].clone(a);
    }
  }
  if (this.statements) {
    for (e in d.statements = {}, this.statements) {
      for (d.statements[e] = this.statements[e].clone(a, 2), c = d.statements[e], c.parentScript = d;c.nextScript;) {
        c = c.nextScript, c.parentScript = d;
      }
    }
  }
  return d;
};
p.getStatement = function(a) {
  return this.statements[a];
};
p.compute = function() {
};
p.getValue = function(a) {
  return this.values[a].run();
};
p.getNumberValue = function(a) {
  return Number(this.values[a].run());
};
p.getStringValue = function(a) {
  return String(this.values[a].run());
};
p.getBooleanValue = function(a) {
  return this.values[a].run() ? !0 : !1;
};
p.getField = function(a) {
  return this.fields[a];
};
p.getStringField = function(a) {
  return String(this.fields[a]);
};
p.getNumberField = function(a) {
  return Number(this.fields[a]);
};
p.callReturn = function() {
  return this.nextScript ? this.nextScript : this.parentScript ? this.parentScript : null;
};
p.run = function() {
  return Entry.block[this.type](this.entity, this);
};
Entry.Stage = function() {
  this.variables = {};
  this.background = new createjs.Shape;
  this.background.graphics.beginFill("#ffffff").drawRect(-480, -240, 960, 480);
  this.objectContainers = [];
  this.selectedObjectContainer = null;
  this.variableContainer = new createjs.Container;
  this.dialogContainer = new createjs.Container;
  this.selectedObject = null;
  this.isObjectClick = !1;
};
Entry.Stage.prototype.initStage = function(a) {
  this.canvas = new createjs.Stage(a.id);
  this.canvas.x = 320;
  this.canvas.y = 180;
  this.canvas.scaleX = this.canvas.scaleY = 2 / 1.5;
  createjs.Touch.enable(this.canvas);
  this.canvas.enableMouseOver(10);
  this.canvas.mouseMoveOutside = !0;
  this.canvas.addChild(this.background);
  this.canvas.addChild(this.variableContainer);
  this.canvas.addChild(this.dialogContainer);
  this.inputField = null;
  this.initCoordinator();
  this.initHandle();
  this.mouseCoordinate = {x:0, y:0};
  if (Entry.isPhone()) {
    a.ontouchstart = function(b) {
      Entry.dispatchEvent("canvasClick", b);
      Entry.stage.isClick = !0;
    }, a.ontouchend = function(b) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", b);
    };
  } else {
    var b = function(b) {
      Entry.dispatchEvent("canvasClick", b);
      Entry.stage.isClick = !0;
    };
    a.onmousedown = b;
    a.ontouchstart = b;
    b = function(b) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", b);
    };
    a.onmouseup = b;
    a.ontouchend = b;
    $(document).click(function(b) {
      Entry.stage.focused = "entryCanvas" === b.target.id ? !0 : !1;
    });
  }
  Entry.addEventListener("canvasClick", function(b) {
    Entry.stage.isObjectClick = !1;
  });
  b = function(b) {
    b.preventDefault();
    var a = this.getBoundingClientRect(), e;
    -1 < Entry.getBrowserType().indexOf("IE") ? (e = 480 * ((b.pageX - a.left - document.documentElement.scrollLeft) / a.width - .5), b = -270 * ((b.pageY - a.top - document.documentElement.scrollTop) / a.height - .5)) : b.changedTouches ? (e = 480 * ((b.changedTouches[0].pageX - a.left - document.body.scrollLeft) / a.width - .5), b = -270 * ((b.changedTouches[0].pageY - a.top - document.body.scrollTop) / a.height - .5)) : (e = 480 * ((b.pageX - a.left - document.body.scrollLeft) / a.width - .5), 
    b = -270 * ((b.pageY - a.top - document.body.scrollTop) / a.height - .5));
    Entry.stage.mouseCoordinate = {x:e.toFixed(1), y:b.toFixed(1)};
    Entry.dispatchEvent("stageMouseMove");
  };
  a.onmousemove = b;
  a.ontouchmove = b;
  a.onmouseout = function(b) {
    Entry.dispatchEvent("stageMouseOut");
  };
  Entry.addEventListener("updateObject", function(b) {
    Entry.engine.isState("stop") && Entry.stage.updateObject();
  });
  Entry.addEventListener("canvasInputComplete", function(b) {
    try {
      var a = Entry.stage.inputField.value();
      Entry.stage.hideInputField();
      if (a) {
        var e = Entry.container;
        e.setInputValue(a);
        e.inputValue.complete = !0;
      }
    } catch (f) {
    }
  });
  this.initWall();
  this.render();
};
Entry.Stage.prototype.render = function() {
  Entry.stage.timer && clearTimeout(Entry.stage.timer);
  var a = (new Date).getTime();
  Entry.stage.update();
  a = (new Date).getTime() - a;
  Entry.stage.timer = setTimeout(Entry.stage.render, 16 - a % 16 + 16 * Math.floor(a / 16));
};
Entry.Stage.prototype.update = function() {
  Entry.engine.isState("stop") && this.objectUpdated ? (this.canvas.update(), this.objectUpdated = !1) : this.canvas.update();
  this.inputField && !this.inputField._isHidden && this.inputField.render();
};
Entry.Stage.prototype.loadObject = function(a) {
  var b = a.entity.object;
  this.getObjectContainerByScene(a.scene).addChild(b);
  this.canvas.update();
};
Entry.Stage.prototype.loadEntity = function(a) {
  Entry.stage.getObjectContainerByScene(a.parent.scene).addChild(a.object);
  this.sortZorder();
};
Entry.Stage.prototype.unloadEntity = function(a) {
  Entry.stage.getObjectContainerByScene(a.parent.scene).removeChild(a.object);
};
Entry.Stage.prototype.loadVariable = function(a) {
  var b = a.view_;
  this.variables[a.id] = b;
  this.variableContainer.addChild(b);
  this.canvas.update();
};
Entry.Stage.prototype.removeVariable = function(a) {
  this.variableContainer.removeChild(a.view_);
  this.canvas.update();
};
Entry.Stage.prototype.loadDialog = function(a) {
  this.dialogContainer.addChild(a.object);
};
Entry.Stage.prototype.unloadDialog = function(a) {
  this.dialogContainer.removeChild(a.object);
};
Entry.Stage.prototype.sortZorder = function() {
  for (var a = Entry.container.getCurrentObjects(), b = this.selectedObjectContainer, d = 0, c = a.length - 1;0 <= c;c--) {
    for (var e = a[c], f = e.entity, e = e.clonedEntities, g = 0, h = e.length;g < h;g++) {
      e[g].shape && b.setChildIndex(e[g].shape, d++), b.setChildIndex(e[g].object, d++);
    }
    f.shape && b.setChildIndex(f.shape, d++);
    b.setChildIndex(f.object, d++);
  }
};
Entry.Stage.prototype.initCoordinator = function() {
  var a = new createjs.Container, b = new createjs.Bitmap(Entry.mediaFilePath + "workspace_coordinate.png");
  b.scaleX = .5;
  b.scaleY = .5;
  b.x = -240;
  b.y = -135;
  a.addChild(b);
  this.canvas.addChild(a);
  a.visible = !1;
  this.coordinator = a;
};
Entry.Stage.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
};
Entry.Stage.prototype.selectObject = function(a) {
  this.selectedObject = a ? a : null;
  this.updateObject();
};
Entry.Stage.prototype.initHandle = function() {
  this.handle = new EaselHandle(this.canvas);
  this.handle.setChangeListener(this, this.updateHandle);
  this.handle.setEditStartListener(this, this.startEdit);
  this.handle.setEditEndListener(this, this.endEdit);
};
Entry.Stage.prototype.updateObject = function() {
  this.handle.setDraggable(!0);
  if (!this.editEntity) {
    var a = this.selectedObject;
    if (a) {
      "textBox" == a.objectType ? this.handle.toggleCenter(!1) : this.handle.toggleCenter(!0);
      "free" == a.getRotateMethod() ? this.handle.toggleRotation(!0) : this.handle.toggleRotation(!1);
      this.handle.toggleDirection(!0);
      a.getLock() ? (this.handle.toggleRotation(!1), this.handle.toggleDirection(!1), this.handle.toggleResize(!1), this.handle.toggleCenter(!1), this.handle.setDraggable(!1)) : this.handle.toggleResize(!0);
      this.handle.setVisible(!0);
      var b = a.entity;
      this.handle.setWidth(b.getScaleX() * b.getWidth());
      this.handle.setHeight(b.getScaleY() * b.getHeight());
      var d, c;
      if ("textBox" == b.type) {
        if (b.getLineBreak()) {
          d = b.regX * b.scaleX, c = -b.regY * b.scaleY;
        } else {
          var e = b.getTextAlign();
          c = -b.regY * b.scaleY;
          switch(e) {
            case Entry.TEXT_ALIGN_LEFT:
              d = -b.getWidth() / 2 * b.scaleX;
              break;
            case Entry.TEXT_ALIGN_CENTER:
              d = b.regX * b.scaleX;
              break;
            case Entry.TEXT_ALIGN_RIGHT:
              d = b.getWidth() / 2 * b.scaleX;
          }
        }
      } else {
        d = (b.regX - b.width / 2) * b.scaleX, c = (b.height / 2 - b.regY) * b.scaleY;
      }
      e = b.getRotation() / 180 * Math.PI;
      this.handle.setX(b.getX() - d * Math.cos(e) - c * Math.sin(e));
      this.handle.setY(-b.getY() - d * Math.sin(e) + c * Math.cos(e));
      this.handle.setRegX((b.regX - b.width / 2) * b.scaleX);
      this.handle.setRegY((b.regY - b.height / 2) * b.scaleY);
      this.handle.setRotation(b.getRotation());
      this.handle.setDirection(b.getDirection());
      this.objectUpdated = !0;
      this.handle.setVisible(a.entity.getVisible());
      a.entity.getVisible() && this.handle.render();
    } else {
      this.handle.setVisible(!1);
    }
  }
};
Entry.Stage.prototype.updateHandle = function() {
  this.editEntity = !0;
  var a = this.handle, b = this.selectedObject.entity;
  b.lineBreak ? (b.setHeight(a.height / b.getScaleY()), b.setWidth(a.width / b.getScaleX())) : (0 !== b.width && (0 > b.getScaleX() ? b.setScaleX(-a.width / b.width) : b.setScaleX(a.width / b.width)), 0 !== b.height && b.setScaleY(a.height / b.height));
  var d = a.rotation / 180 * Math.PI;
  if ("textBox" == b.type) {
    var c;
    if (b.getLineBreak()) {
      b.setX(a.x), b.setY(-a.y);
    } else {
      switch(b.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          b.setX(a.x - a.width / 2 * Math.cos(d));
          b.setY(-a.y + a.width / 2 * Math.sin(d));
          break;
        case Entry.TEXT_ALIGN_CENTER:
          b.setX(a.x);
          b.setY(-a.y);
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          b.setX(a.x + a.width / 2 * Math.cos(d)), b.setY(-a.y - a.width / 2 * Math.sin(d));
      }
    }
  } else {
    c = b.width / 2 + a.regX / b.scaleX, b.setX(a.x + a.regX * Math.cos(d) - a.regY * Math.sin(d)), b.setRegX(c), c = b.height / 2 + a.regY / b.scaleY, b.setY(-a.y - a.regX * Math.sin(d) - a.regY * Math.cos(d)), b.setRegY(c);
  }
  b.setDirection(a.direction);
  b.setRotation(a.rotation);
  this.selectedObject.entity.doCommand();
  this.editEntity = !1;
};
Entry.Stage.prototype.startEdit = function() {
  this.selectedObject.entity.initCommand();
};
Entry.Stage.prototype.endEdit = function() {
  this.selectedObject.entity.checkCommand();
};
Entry.Stage.prototype.initWall = function() {
  var a = new createjs.Container, b = new Image;
  b.src = Entry.mediaFilePath + "media/bound.png";
  a.up = new createjs.Bitmap;
  a.up.scaleX = 16;
  a.up.y = -165;
  a.up.x = -240;
  a.up.image = b;
  a.addChild(a.up);
  a.down = new createjs.Bitmap;
  a.down.scaleX = 16;
  a.down.y = 135;
  a.down.x = -240;
  a.down.image = b;
  a.addChild(a.down);
  a.right = new createjs.Bitmap;
  a.right.scaleY = 9;
  a.right.y = -135;
  a.right.x = 240;
  a.right.image = b;
  a.addChild(a.right);
  a.left = new createjs.Bitmap;
  a.left.scaleY = 9;
  a.left.y = -135;
  a.left.x = -270;
  a.left.image = b;
  a.addChild(a.left);
  this.canvas.addChild(a);
  this.wall = a;
};
Entry.Stage.prototype.showInputField = function(a) {
  a = 1 / 1.5;
  this.inputField || (this.inputField = new CanvasInput({canvas:document.getElementById("entryCanvas"), fontSize:30 * a, fontFamily:"NanumGothic", fontColor:"#212121", width:556 * a, height:26 * a, padding:8 * a, borderWidth:1 * a, borderColor:"#000", borderRadius:3 * a, boxShadow:"none", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:202 * a, y:450 * a, topPosition:!0, onsubmit:function() {
    Entry.dispatchEvent("canvasInputComplete");
  }}));
  a = new createjs.Container;
  var b = new Image;
  b.src = Entry.mediaFilePath + "confirm_button.png";
  var d = new createjs.Bitmap;
  d.scaleX = .23;
  d.scaleY = .23;
  d.x = 160;
  d.y = 89;
  d.cursor = "pointer";
  d.image = b;
  a.addChild(d);
  a.on("mousedown", function(b) {
    Entry.dispatchEvent("canvasInputComplete");
  });
  this.inputSubmitButton || (this.inputField.value(""), this.canvas.addChild(a), this.inputSubmitButton = a);
  this.inputField.show();
};
Entry.Stage.prototype.hideInputField = function() {
  this.inputField && this.inputField.value() && this.inputField.value("");
  this.inputSubmitButton && (this.canvas.removeChild(this.inputSubmitButton), this.inputSubmitButton = null);
  this.inputField && this.inputField.hide();
};
Entry.Stage.prototype.initObjectContainers = function() {
  var a = Entry.scene.scenes_;
  if (a && 0 !== a.length) {
    for (var b = 0;b < a.length;b++) {
      this.objectContainers[b] = this.createObjectContainer(a[b]);
    }
    this.selectedObjectContainer = this.objectContainers[0];
  } else {
    a = this.createObjectContainer(Entry.scene.selectedScene), this.objectContainers.push(a), this.selectedObjectContainer = a;
  }
  this.canvas.addChild(this.selectedObjectContainer);
  this.selectObjectContainer(Entry.scene.selectedScene);
};
Entry.Stage.prototype.selectObjectContainer = function(a) {
  if (this.canvas) {
    for (var b = this.objectContainers, d = 0;d < b.length;d++) {
      this.canvas.removeChild(b[d]);
    }
    this.selectedObjectContainer = this.getObjectContainerByScene(a);
    this.canvas.addChildAt(this.selectedObjectContainer, 2);
  }
};
Entry.Stage.prototype.reAttachToCanvas = function() {
  for (var a = [this.selectedObjectContainer, this.variableContainer, this.coordinator, this.handle, this.dialogContainer], b = 0;b < a.length;b++) {
    this.canvas.removeChild(a[b]), this.canvas.addChild(a[b]);
  }
  console.log(this.canvas.getChildIndex(this.selectedObjectContainer));
};
Entry.Stage.prototype.createObjectContainer = function(a) {
  var b = new createjs.Container;
  b.scene = a;
  return b;
};
Entry.Stage.prototype.removeObjectContainer = function(a) {
  var b = this.objectContainers;
  a = this.getObjectContainerByScene(a);
  this.canvas.removeChild(a);
  b.splice(this.objectContainers.indexOf(a), 1);
};
Entry.Stage.prototype.getObjectContainerByScene = function(a) {
  for (var b = this.objectContainers, d = 0;d < b.length;d++) {
    if (b[d].scene.id == a.id) {
      return b[d];
    }
  }
};
Entry.Stage.prototype.moveSprite = function(a) {
  if (this.selectedObject && Entry.stage.focused && !this.selectedObject.getLock()) {
    var b = 5;
    a.shiftKey && (b = 1);
    var d = this.selectedObject.entity;
    switch(a.keyCode) {
      case 38:
        d.setY(d.getY() + b);
        break;
      case 40:
        d.setY(d.getY() - b);
        break;
      case 37:
        d.setX(d.getX() - b);
        break;
      case 39:
        d.setX(d.getX() + b);
    }
    this.updateObject();
  }
};
Entry.StampEntity = function(a, b) {
  this.parent = a;
  this.type = a.objectType;
  this.isStamp = this.isClone = !0;
  this.width = b.getWidth();
  this.height = b.getHeight();
  "sprite" == this.type && (this.object = b.object.clone(!0), this.object.filters = null, b.effect && (this.effect = Entry.cloneSimpleObject(b.effect), this.applyFilter()));
  this.object.entity = this;
  b.dialog && (a = b.dialog, new Entry.Dialog(this, a.message_, a.mode_, !0), this.dialog.object = b.dialog.object.clone(!0), Entry.stage.loadDialog(this.dialog));
};
var EntityPrototype = Entry.EntityObject.prototype;
Entry.StampEntity.prototype.applyFilter = EntityPrototype.applyFilter;
Entry.StampEntity.prototype.removeClone = EntityPrototype.removeClone;
Entry.StampEntity.prototype.getWidth = EntityPrototype.getWidth;
Entry.StampEntity.prototype.getHeight = EntityPrototype.getHeight;
Entry.JsAstGenerator = function() {
};
(function(a) {
  a.generate = function(b) {
    return arcon.parse(b);
  };
})(Entry.JsAstGenerator.prototype);
Entry.PyAstGenerator = function() {
};
(function(a) {
  a.generate = function(b) {
    var a = filbert.parse, c = {locations:!1, ranges:!1}, e;
    try {
      return e = a(b, c), console.log("astTree", e), e;
    } catch (f) {
      throw f.message = "  \ud30c\uc774\uc36c \ubb38\ubc95\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694", f;
    }
  };
})(Entry.PyAstGenerator.prototype);
Entry.Map = function() {
  this._map = {repo:{}};
};
(function(a) {
  a.getKey = function(b) {
    return b;
  };
  a.put = function(b, a) {
    b = this.getKey(b);
    this._map.repo[b] = a;
  };
  a.contains = function(b) {
    b = this.getKey(b);
    return this._map.repo[b] ? !0 : !1;
  };
  a.get = function(b) {
    b = this.getKey(b);
    return this._map.repo[b] ? this._map.repo[b] : null;
  };
  a.remove = function(b) {
    var a = this.getKey(b);
    this.contains(b) && (this._map.repo[a] = void 0);
  };
  a.clear = function() {
    this._map.repo = {};
  };
  a.toString = function() {
    return this._map.repo;
  };
})(Entry.Map.prototype);
Entry.Queue = function() {
  this.tail = this.head = null;
};
function Node(a) {
  this.data = a;
  this.next = null;
}
(function(a) {
  a.enqueue = function(b) {
    b = new Node(b);
    null === this.head ? this.head = b : this.tail.next = b;
    this.tail = b;
  };
  a.dequeue = function() {
    var b;
    null !== this.head && (b = this.head.data, this.head = this.head.next);
    return b;
  };
  a.clear = function() {
    for (;this.dequeue();) {
    }
  };
  a.toString = function() {
    for (var b = this.head, a = [];b;) {
      a.push(b.data), b = b.next;
    }
    return a.toString();
  };
})(Entry.Queue.prototype);
Entry.BlockToJsParser = function(a) {
  this.syntax = a;
  this._iterVariableCount = 0;
  this._iterVariableChunk = ["i", "j", "k"];
};
(function(a) {
  a.Code = function(b) {
    if (b instanceof Entry.Thread) {
      return this.Thread(b);
    }
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var a = "";
    b = b.getThreads();
    for (var c = 0;c < b.length;c++) {
      a += this.Thread(b[c]);
    }
    return a;
  };
  a.Thread = function(b) {
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var a = "";
    b = b.getBlocks();
    for (var c = 0;c < b.length;c++) {
      a += this.Block(b[c]);
    }
    return a;
  };
  a.Block = function(b) {
    var a = b._schema.syntax;
    if (!a) {
      return "";
    }
    console.log("syntaxType", a);
    return this[a](b);
  };
  a.Program = function(b) {
    return "";
  };
  a.Scope = function(b) {
    b = b._schema.syntax.concat();
    return b.splice(1, b.length - 1).join(".") + "();\n";
  };
  a.BasicFunction = function(b) {
    b = this.Thread(b.statements[0]);
    return "function promise() {\n" + this.indent(b) + "}\n";
  };
  a.BasicIteration = function(b) {
    var a = b.params[0], c = this.publishIterateVariable();
    b = this.Thread(b.statements[0]);
    this.unpublishIterateVariable();
    return "for (var " + c + " = 0; " + c + " < " + a + "; " + c + "++){\n" + this.indent(b) + "}\n";
  };
  a.BasicIf = function(b) {
    var a = this.Thread(b.statements[0]);
    return "if (" + b._schema.syntax.concat()[1] + ") {\n" + this.indent(a) + "}\n";
  };
  a.BasicWhile = function(b) {
    var a = this.Thread(b.statements[0]);
    return "while (" + b._schema.syntax.concat()[1] + ") {\n" + this.indent(a) + "}\n";
  };
  a.indent = function(b) {
    var a = "    ";
    b = b.split("\n");
    b.pop();
    return a += b.join("\n    ") + "\n";
  };
  a.publishIterateVariable = function() {
    var b = "", a = this._iterVariableCount;
    do {
      b = this._iterVariableChunk[a % 3] + b, a = parseInt(a / 3) - 1, 0 === a && (b = this._iterVariableChunk[0] + b);
    } while (0 < a);
    this._iterVariableCount++;
    return b;
  };
  a.unpublishIterateVariable = function() {
    this._iterVariableCount && this._iterVariableCount--;
  };
})(Entry.BlockToJsParser.prototype);
Entry.KeyboardCode = function() {
};
(function(a) {
  a.keyCodeToChar = {8:"Backspace", 9:"Tab", 13:"Enter", 16:"Shift", 17:"Ctrl", 18:"Alt", 19:"Pause/Break", 20:"Caps Lock", 27:"Esc", 32:"Space", 33:"Page Up", 34:"Page Down", 35:"End", 36:"Home", 37:"Left", 38:"Up", 39:"Right", 40:"Down", 45:"Insert", 46:"Delete", 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 65:"A", 66:"B", 67:"C", 68:"D", 69:"E", 70:"F", 71:"G", 72:"H", 73:"I", 74:"J", 75:"K", 76:"L", 77:"M", 78:"N", 79:"O", 80:"P", 81:"Q", 82:"R", 83:"S", 84:"T", 
  85:"U", 86:"V", 87:"W", 88:"X", 89:"Y", 90:"Z", 91:"Windows", 93:"Right Click", 96:"Numpad 0", 97:"Numpad 1", 98:"Numpad 2", 99:"Numpad 3", 100:"Numpad 4", 101:"Numpad 5", 102:"Numpad 6", 103:"Numpad 7", 104:"Numpad 8", 105:"Numpad 9", 106:"Numpad *", 107:"Numpad +", 109:"Numpad -", 110:"Numpad .", 111:"Numpad /", 112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 144:"Num Lock", 145:"Scroll Lock", 182:"My Computer", 183:"My Calculator", 
  186:";", 187:"=", 188:",", 189:"-", 190:".", 191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"'"};
  a.keyCharToCode = {Backspace:8, Tab:9, Enter:13, Shift:16, Ctrl:17, Alt:18, "Pause/Break":19, "Caps Lock":20, Esc:27, Space:32, "Page Up":33, "Page Down":34, End:35, Home:36, Left:37, Up:38, Right:39, Down:40, Insert:45, Delete:46, 0:48, 1:49, 2:50, 3:51, 4:52, 5:53, 6:54, 7:55, 8:56, 9:57, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, L:76, M:77, N:78, O:79, P:80, Q:81, R:82, S:83, T:84, U:85, V:86, W:87, X:88, Y:89, Z:90, Windows:91, "Right Click":93, "Numpad 0":96, "Numpad 1":97, 
  "Numpad 2":98, "Numpad 3":99, "Numpad 4":100, "Numpad 5":101, "Numpad 6":102, "Numpad 7":103, "Numpad 8":104, "Numpad 9":105, "Numpad *":106, "Numpad +":107, "Numpad -":109, "Numpad .":110, "Numpad /":111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, "Num Lock":144, "Scroll Lock":145, "My Computer":182, "My Calculator":183, ";":186, "=":187, ",":188, "-":189, ".":190, "/":191, "`":192, "[":219, "\\":220, "]":221, "'":222};
})(Entry.KeyboardCode.prototype);
Entry.TextCodingUtil = function() {
};
(function(a) {
  a.indent = function(b) {
    console.log("indent textCode", b);
    var a = "\t";
    b = b.split("\n");
    b.pop();
    a += b.join("\n\t");
    console.log("indent result", a);
    return a;
  };
  a.isNumeric = function(b) {
    return b.match(/^-?\d+$|^-\d+$/) || b.match(/^-?\d+\.\d+$/) ? !0 : !1;
  };
  a.isBinaryOperator = function(b) {
    return "==" == b || ">" == b || "<" == b || ">=" == b || "<=" == b || "+" == b || "-" == b || "*" == b || "/" == b ? !0 : !1;
  };
  a.binaryOperatorConvert = function(b) {
    console.log("binaryOperatorConvert", b);
    switch(b) {
      case "==":
        b = "EQUAL";
        break;
      case ">":
        b = "GREATER";
        break;
      case "<":
        b = "LESS";
        break;
      case ">=":
        b = "GREATER_OR_EQUAL";
        break;
      case "<=":
        b = "LESS_OR_EQUAL";
        break;
      case "+":
        b = "PLUS";
        break;
      case "-":
        b = "MINUS";
        break;
      case "*":
        b = "MULTIFLY";
        break;
      case "/":
        b = "DIVIDE";
        break;
    }
    return b;
  };
  a.logicalExpressionConvert = function(b) {
    console.log("logicalExpressionConvert", b);
    switch(b) {
      case "&&":
        b = null;
        break;
      case "||":
        b = null;
        break;
    }
    return b;
  };
  a.dropdownDynamicValueConvertor = function(b, a) {
    var c = a.options;
    console.log("dropdownDynamicValueConvertor value", b, "options", c);
    for (var e in c) {
      var f = c[e];
      if ("null" == f[1]) {
        return c = "none";
      }
      if ("mouse" == b || "wall" == b || "wall_up" == b || "wall_down" == b || "wall_right" == b || "wall_left" == b) {
        return b;
      }
      console.log("dropdownDynamicValueConvertor check value", b, "option", f);
      if (b == f[1]) {
        return c = f[0];
      }
    }
    c = b;
    if ("variables" == a.menuName) {
      var g = Entry.variableContainer.variables_;
      console.log("dropdownDynamicValueConvertor entryVariables", g);
      for (var h in g) {
        var k = g[h];
        if (k.id_ == b) {
          c = k.name_;
          break;
        }
      }
    } else {
      if ("lists" == a.menuName) {
        for (h in g = Entry.variableContainer.lists, console.log("dropdownDynamicValueConvertor entryLists", g), g) {
          if (k = g[h], k.id_ == b) {
            c = k.name_;
            break;
          }
        }
      } else {
        if ("pictures" == a.menuName) {
          for (g in h = Entry.container.getAllObjects(), h) {
            for (k in a = h[g], a = a.pictures, a) {
              if (e = a[k], e.id == b) {
                return c = e.name;
              }
            }
          }
        } else {
          if ("sounds" == a.menuName) {
            for (g in h = Entry.container.getAllObjects(), h) {
              for (k in a = h[g], a = a.sounds, a) {
                if (e = a[k], e.id == b) {
                  return c = e.name;
                }
              }
            }
          }
        }
      }
    }
    console.log("b to py dd", c);
    return c;
  };
  a.binaryOperatorValueConvertor = function(b) {
    switch(b) {
      case "EQUAL":
        console.log("EQUAL");
        b = "==";
        break;
      case "GREATER":
        b = ">";
        break;
      case "LESS":
        b = "<";
        break;
      case "GREATER_OR_EQUAL":
        b = ">=";
        break;
      case "LESS_OR_EQUAL":
        b = "<=";
        break;
      case "\uadf8\ub9ac\uace0":
        b = "&&";
        break;
      case "\ub610\ub294":
        b = "||";
        break;
      case "PLUS":
        b = "+";
        break;
      case "MINUS":
        b = "-";
        break;
      case "MULTI":
        b = "*";
        break;
      case "DIVIDE":
        b = "/";
        break;
    }
    console.log("binaryOperatorValueConvertor result", b);
    return b;
  };
  a.variableFilter = function(b, a, c) {
    console.log("paramFilter block index param", b, a, c);
    var e = c;
    b = b.data.type;
    "change_variable" != b && "set_variable" != b && "get_variable" != b || 1 != a || (console.log("paramFilter", eval(c)), e = eval(c));
    return e;
  };
})(Entry.TextCodingUtil.prototype);
Entry.BlockToPyParser = function(a) {
  this.blockSyntax = a;
  this._variableMap = new Entry.Map;
  this._funcMap = new Entry.Map;
  this._queue = new Entry.Queue;
};
(function(a) {
  a.Code = function(b, a) {
    this._parseMode = a;
    console.log("parseMode", this._parseMode);
    if (b instanceof Entry.Thread) {
      return this.Thread(b);
    }
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    a = "";
    b = b.getThreads();
    console.log("threads", b);
    for (var c = 0;c < b.length;c++) {
      a += this.Thread(b[c]) + "\n";
    }
    return a;
  };
  a.Thread = function(b) {
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var a = "";
    b = b.getBlocks();
    console.log("blocks", b);
    for (var c = 0;c < b.length;c++) {
      a += this.Block(b[c]) + "\n", this._queue.clear(), this._variableMap.clear();
    }
    return a;
  };
  a.Block = function(b) {
    var a = "", c;
    b._schema && b._schema.syntax && (c = b._schema.syntax.py[0]);
    this.isFunc(b) ? (console.log("Block isFunc", b), a += this.makeFuncDef(b), this.isRegisteredFunc(b) && (c = this.makeFuncSyntax(b)), console.log("Func Fianl Syntax", c)) : this.isFuncStmtParam(b) && (a += b.data.type);
    console.log("Block Syntax", c);
    if (!c || null == c) {
      return a;
    }
    var e = /(%.)/mi, f = /(\$.)/mi;
    c = c.split(e);
    var g = b._schema.params, h = b.data.params;
    console.log("Block blockTokens", c);
    var k = b._schema.skeleton, l = b._schema.paramsKeyMap;
    console.log("currentBlock", b, "currentBlockSkeleton", k, "currentBlockParamsKeyMap", l);
    var m;
    if (this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && l) {
      var n
    }
    console.log("Block schemaParams", g);
    console.log("Block dataParams", h);
    for (var q = 0;q < c.length;q++) {
      if (n = c[q], 0 !== n.length) {
        if (e.test(n)) {
          n = n.split("%")[1];
          var r = Number(n) - 1;
          if (g[r]) {
            if ("Indicator" != g[r].type) {
              if ("Block" == g[r].type) {
                console.log("Block dataParams[index]", h[r]);
                console.log("Block param current block1", b);
                var t = this.Block(h[r]).trim();
                console.log("funcMap", this._funcMap.toString());
                m = this._funcMap.get(t);
                console.log("param", t, "func param", m);
                m ? (console.log("func param current result", a), a += m) : (m = t.split("_"), console.log("funcParamTokens", m), r = m[0], 2 == m.length && ("stringParam" == r ? t = "string_param" : "booleanParam" == r && (t = "boolean_param")), console.log("Block param current block2", b), a += t, console.log("PARAM BLOCK", t), console.log("PARAM BLOCK RESULT ", a), this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && l && (m = t, console.log("basic block param", 
                t, "i", q), t = Object.keys(l), n = String(t[n++]), n = n.toLowerCase(), console.log("variable", n), t = m, console.log("value", t), this._variableMap.put(n, t), this._queue.enqueue(n), console.log("Variable Map", this._variableMap.toString()), console.log("Queue", this._queue.toString())));
              } else {
                m = h[r];
                t = this["Field" + g[r].type](h[r], g[r]);
                null == t && (t = g[r].text ? g[r].text : null);
                t = Entry.TextCodingUtil.prototype.binaryOperatorValueConvertor(t);
                t = String(t);
                Entry.TextCodingUtil.prototype.isNumeric(t) || Entry.TextCodingUtil.prototype.isBinaryOperator(t) || (t = String('"' + t + '"'));
                t = Entry.TextCodingUtil.prototype.variableFilter(b, n, t);
                if ("get_variable" == b.data.type || "set_variable" == b.data.type || "change_variable" == b.data.type) {
                  console.log("check in set_variable");
                  r = Entry.variableContainer.variables_;
                  console.log("entryVariables", r, "param", t);
                  for (var u in r) {
                    var v = r[u];
                    m == v.id_ && v.object_ && (v = Entry.container.getObject(v.object_), console.log("entry variable object", v), t = v.name.concat(".").concat(t));
                  }
                }
                a += t;
                console.log("PARAM BLOCK", t);
                console.log("PARAM BLOCK RESULT ", a);
                this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && l && (m = t, console.log("basic block param", t, "i", q), t = Object.keys(l), n = String(t[n++]), n = n.toLowerCase(), console.log("variable", n), t = m, console.log("value", t), this._variableMap.put(n, t), this._queue.enqueue(n), console.log("Variable Map", this._variableMap), console.log("Queue", this._queue));
              }
            }
          } else {
            console.log("This Block has No Schema");
          }
        } else {
          if (f.test(n)) {
            for (n = n.split(f), t = 0;t < n.length;t++) {
              m = n[t], 0 !== m.length && (f.test(m) ? (r = Number(m.split("$")[1]) - 1, a += Entry.TextCodingUtil.prototype.indent(this.Thread(b.statements[r]))) : (a += m, this._parseMode == Entry.Parser.PARSE_VARIABLE && (this._currentBlockSkeleton == Entry.Parser.BLOCK_SKELETON_BASIC_LOOP || this._currentBlockSkeleton == Entry.Parser.BLOCK_SKELETON_BASIC_DOUBLE_LOOP) && this._currentBlockParamsKeyMap && 0 == t && console.log("This result is the beginning of Block Statement")));
            }
          } else {
            n.search("#"), -1 != n.search("#") && (t = n.indexOf("#"), n = n.substring(t + 1)), a += n, console.log("check result", a);
          }
        }
      }
    }
    this._parseMode == Entry.Parser.PARSE_VARIABLE && (console.log("check1"), k == Entry.Parser.BLOCK_SKELETON_BASIC && (console.log("check2"), l && (console.log("check3"), (b = Object.keys(l).length) && (a = this.makeExpressionWithVariable(a, b)))));
    return a;
  };
  a.FieldAngle = function(b) {
    console.log("FieldAngle", b);
    return b;
  };
  a.FieldColor = function(b) {
    console.log("FieldColor", b);
    return b;
  };
  a.FieldDropdown = function(b) {
    console.log("FieldDropdown", b);
    return b;
  };
  a.FieldDropdownDynamic = function(b, a) {
    console.log("FieldDropdownDynamic", b, a);
    console.log("FieldDropdownDynamic Object", Entry.stage.selectedObject);
    b = "null" == b ? "none" : Entry.TextCodingUtil.prototype.dropdownDynamicValueConvertor(b, a);
    console.log("FieldDropdownDynamic result ", b);
    return b;
  };
  a.FieldImage = function(b) {
    console.log("FieldImage", b);
    return b;
  };
  a.FieldIndicator = function(b) {
    console.log("FieldIndicator", b);
    return b;
  };
  a.FieldKeyboard = function(b) {
    console.log("FieldKeyboardInput", b);
    return b;
  };
  a.FieldOutput = function(b) {
    console.log("FieldOutput", b);
    return b;
  };
  a.FieldText = function(b) {
    console.log("FieldText", b);
    return b;
  };
  a.FieldTextInput = function(b) {
    console.log("FieldTextInput", b);
    return b;
  };
  a.FieldNumber = function(b) {
    console.log("FieldNumber", b);
    return b;
  };
  a.FieldKeyboard = function(b) {
    console.log("FieldKeyboard Before", b);
    (b = Entry.KeyboardCode.prototype.keyCodeToChar[b]) && null != b || (b = "Q");
    console.log("FieldKeyboard After", b);
    return b;
  };
  a.getBlockType = function(b) {
    return this.blockSyntax[b];
  };
  a.makeExpressionWithVariable = function(b, a) {
    console.log("makeExpressionWithVariable blockExp", b);
    console.log("makeExpressionWithVariable Queue", this._queue.toString());
    console.log("makeExpressionWithVariable VariableMap", this._variableMap.toString());
    var c = "", e = 0, f = b.indexOf("(");
    a = b.substring(0, f).trim().concat("(");
    if (this._queue.toString()) {
      for (;(variable = this._queue.dequeue()) && !(console.log("makeExpressionWithVariable variable", variable), b = this._variableMap.get(variable), console.log("makeExpressionWithVariable value", b), b = variable.concat(" = ").concat(b).concat("\n"), c += b, a = a.concat(variable).concat(",").concat(" "), e++, 10 < e);) {
      }
      f = a.lastIndexOf(",");
      a = a.substring(0, f);
      a = a.trim().concat(")");
      a = c.concat(a);
    } else {
      a = b;
    }
    console.log("makeExpressionWithVariable result", a);
    return a;
  };
  a.isFunc = function(b) {
    return "func" == b.data.type.split("_")[0] ? !0 : !1;
  };
  a.isRegisteredFunc = function(b) {
    b = b.data.type.split("_")[1];
    return Entry.variableContainer.functions_[b] ? !0 : !1;
  };
  a.isFuncStmtParam = function(b) {
    b = b.data.type.split("_")[0];
    console.log("isFuncStmtParam prefix", b);
    return "stringParam" == b || "booleanParam" == b ? !0 : !1;
  };
  a.makeFuncSyntax = function(b) {
    var a = b._schema.template.trim();
    console.log("Func schemaTemplate", a);
    b = b._schema.params;
    console.log("Func schemaParams", b);
    var c = /(%.)/mi, a = a.trim().split(c);
    console.log("funcTokens", a);
    var e = "", f = "", g;
    for (g in a) {
      var h = a[g].trim();
      console.log("funcToken", h);
      if (c.test(h)) {
        var k = h.split("%")[1], k = Number(k) - 1;
        "Indicator" != b[k].type && (f += h.concat(", "));
      } else {
        h = h.split(" "), e += h.join("_");
      }
    }
    k = f.lastIndexOf(",");
    f = f.substring(0, k);
    return e.trim().concat("(").concat(f.trim()).concat(")");
  };
  a.makeFuncDef = function(b) {
    var a = "def ", c = this.getFuncInfo(b);
    console.log("makeFuncDef func", c);
    this.isRegisteredFunc(b) || (c.name = "f");
    if (c.name) {
      a += c.name;
    } else {
      return a;
    }
    a = a.concat("(");
    if (c.params && 0 != c.params.length) {
      for (var e in c.params) {
        a += c.params[e], a = a.concat(", ");
      }
      b = a.lastIndexOf(",");
      a = a.substring(0, b);
      a = a.trim();
    }
    a = a.concat("):").concat("\n");
    if (c.statements && c.statements.length) {
      b = "";
      for (var f in c.statements) {
        e = c.statements[f], console.log("makeFuncDef statements", e), b += this.Block(e).concat("\n");
      }
      b = b.concat("\n");
      a += Entry.TextCodingUtil.prototype.indent(b).concat("\n");
    }
    console.log("makeFuncDef result", a);
    this._funcMap.clear();
    return a;
  };
  a.getFuncInfo = function(b) {
    console.log("getFuncInfo funcBlock", b);
    var a = {};
    b = b.data.type.split("_")[1];
    console.log("getFuncInfo id", b);
    if (b) {
      var c = Entry.variableContainer.functions_[b];
      if (!c) {
        return a.name = "\ud568\uc218", a;
      }
    } else {
      return a;
    }
    console.log("getFuncInfo func", c);
    b = c.block.template;
    var e = b.search(/(%.)/);
    console.log("getFuncInfo index", e);
    b = b.substring(0, e).trim().split(" ").join("_");
    console.log("getFuncInfo funcName", b);
    var f = c.paramMap;
    if (f) {
      var g = {}, h;
      for (h in f) {
        var e = f[h], k = h.search("_"), k = h.substring(0, k);
        if ("stringParam" == k) {
          var l = "param" + String(e + 1) + "_value"
        } else {
          "booleanParam" == k && (l = "param" + String(e + 1) + "_boolean");
        }
        k = l;
        g[e] = k;
        this._funcMap.put(h, k);
      }
    }
    h = c.content._data[0]._data;
    l = [];
    for (c = 1;c < h.length;c++) {
      l.push(h[c]);
    }
    console.log("getFuncInfo funcContents", l);
    b && (a.name = b);
    0 != Object.keys(g).length && (a.params = g);
    0 != l.length && (a.statements = l);
    return a;
  };
})(Entry.BlockToPyParser.prototype);
Entry.JsToBlockParser = function(a) {
  this.syntax = a;
  this.scopeChain = [];
  this.scope = null;
};
(function(a) {
  a.Program = function(b) {
    var a = [], c = [];
    c.push({type:this.syntax.Program});
    var e = this.initScope(b), c = c.concat(this.BlockStatement(b));
    this.unloadScope();
    a.push(c);
    return a = a.concat(e);
  };
  a.Identifier = function(b, a) {
    return a ? a[b.name] : this.scope[b.name];
  };
  a.ExpressionStatement = function(b) {
    b = b.expression;
    return this[b.type](b);
  };
  a.ForStatement = function(b) {
    var a = b.init, c = b.test, e = b.update, f = b.body;
    if (this.syntax.ForStatement) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    var f = this[f.type](f), a = a.declarations[0].init.value, g = c.operator, c = c.right.value, h = 0;
    "++" != e.operator && (e = a, a = c, c = e);
    switch(g) {
      case "<":
        h = c - a;
        break;
      case "<=":
        h = c + 1 - a;
        break;
      case ">":
        h = a - c;
        break;
      case ">=":
        h = a + 1 - c;
    }
    return this.BasicIteration(b, h, f);
  };
  a.BlockStatement = function(b) {
    var a = [];
    b = b.body;
    for (var c = 0;c < b.length;c++) {
      var e = b[c], f = this[e.type](e);
      if (f) {
        if (void 0 === f.type) {
          throw {message:"\ud574\ub2f9\ud558\ub294 \ube14\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.", node:e};
        }
        f && a.push(f);
      }
    }
    return a;
  };
  a.EmptyStatement = function(b) {
    throw {message:"empty\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.DebuggerStatement = function(b) {
    throw {message:"debugger\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.WithStatement = function(b) {
    throw {message:"with\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ReturnStaement = function(b) {
    throw {message:"return\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.LabeledStatement = function(b) {
    throw {message:"label\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.BreakStatement = function(b) {
    throw {message:"break\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ContinueStatement = function(b) {
    throw {message:"continue\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.IfStatement = function(b) {
    if (this.syntax.IfStatement) {
      throw {message:"if\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return this.BasicIf(b);
  };
  a.SwitchStatement = function(b) {
    throw {message:"switch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.SwitchCase = function(b) {
    throw {message:"switch ~ case\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ThrowStatement = function(b) {
    throw {message:"throw\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.TryStatement = function(b) {
    throw {message:"try\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.CatchClause = function(b) {
    throw {message:"catch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.WhileStatement = function(b) {
    var a = b.body, c = this.syntax.WhileStatement, a = this[a.type](a);
    if (c) {
      throw {message:"while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return this.BasicWhile(b, a);
  };
  a.DoWhileStatement = function(b) {
    throw {message:"do ~ while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ForInStatement = function(b) {
    throw {message:"for ~ in\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.FunctionDeclaration = function(b) {
    if (this.syntax.FunctionDeclaration) {
      throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return null;
  };
  a.VariableDeclaration = function(b) {
    throw {message:"var\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ThisExpression = function(b) {
    return this.scope.this;
  };
  a.ArrayExpression = function(b) {
    throw {message:"array\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ObjectExpression = function(b) {
    throw {message:"object\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.Property = function(b) {
    throw {message:"init, get, set\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.FunctionExpression = function(b) {
    throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UnaryExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UnaryOperator = function() {
    return "- + ! ~ typeof void delete".split(" ");
  };
  a.updateOperator = function() {
    return ["++", "--"];
  };
  a.BinaryOperator = function() {
    return "== != === !== < <= > >= << >> >>> + - * / % , ^ & in instanceof".split(" ");
  };
  a.AssignmentExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.AssignmentOperator = function() {
    return "= += -= *= /= %= <<= >>= >>>= ,= ^= &=".split(" ");
  };
  a.LogicalExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.LogicalOperator = function() {
    return ["||", "&&"];
  };
  a.MemberExpression = function(b) {
    var a = b.object, c = b.property;
    console.log(a.type);
    a = this[a.type](a);
    console.log(a);
    c = this[c.type](c, a);
    if (Object(a) !== a || Object.getPrototypeOf(a) !== Object.prototype) {
      throw {message:a + "\uc740(\ub294) \uc798\ubabb\ub41c \uba64\ubc84 \ubcc0\uc218\uc785\ub2c8\ub2e4.", node:b};
    }
    a = c;
    if (!a) {
      throw {message:c + "\uc774(\uac00) \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.", node:b};
    }
    return a;
  };
  a.ConditionalExpression = function(b) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UpdateExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.CallExpression = function(b) {
    b = b.callee;
    return {type:this[b.type](b)};
  };
  a.NewExpression = function(b) {
    throw {message:"new\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.SequenceExpression = function(b) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.initScope = function(b) {
    if (null === this.scope) {
      var a = function() {
      };
      a.prototype = this.syntax.Scope;
    } else {
      a = function() {
      }, a.prototype = this.scope;
    }
    this.scope = new a;
    this.scopeChain.push(this.scope);
    return this.scanDefinition(b);
  };
  a.unloadScope = function() {
    this.scopeChain.pop();
    this.scope = this.scopeChain.length ? this.scopeChain[this.scopeChain.length - 1] : null;
  };
  a.scanDefinition = function(b) {
    b = b.body;
    for (var a = [], c = 0;c < b.length;c++) {
      var e = b[c];
      "FunctionDeclaration" === e.type && (this.scope[e.id.name] = this.scope.promise, this.syntax.BasicFunction && (e = e.body, a.push([{type:this.syntax.BasicFunction, statements:[this[e.type](e)]}])));
    }
    return a;
  };
  a.BasicFunction = function(b, a) {
    return null;
  };
  a.BasicIteration = function(b, a, c) {
    var e = this.syntax.BasicIteration;
    if (!e) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return {params:[a], type:e, statements:[c]};
  };
  a.BasicWhile = function(b, a) {
    var c = b.test.raw;
    if (this.syntax.BasicWhile[c]) {
      return {type:this.syntax.BasicWhile[c], statements:[a]};
    }
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
  };
  a.BasicIf = function(b) {
    var a = b.consequent, a = this[a.type](a);
    try {
      var c = "", e = "===" === b.test.operator ? "==" : b.test.operator;
      if ("Identifier" === b.test.left.type && "Literal" === b.test.right.type) {
        c = b.test.left.name + " " + e + " " + b.test.right.raw;
      } else {
        if ("Literal" === b.test.left.type && "Identifier" === b.test.right.type) {
          c = b.test.right.name + " " + e + " " + b.test.left.raw;
        } else {
          throw Error();
        }
      }
      if (this.syntax.BasicIf[c]) {
        return Array.isArray(a) || "object" !== typeof a || (a = [a]), {type:this.syntax.BasicIf[c], statements:[a]};
      }
      throw Error();
    } catch (f) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
    }
  };
})(Entry.JsToBlockParser.prototype);
Entry.PyToBlockParser = function(a) {
  this.blockSyntax = a;
  this._blockStatmentIndex = 0;
  this._blockStatments = [];
  this._variableMap = new Entry.Map;
  this._funcMap = new Entry.Map;
};
(function(a) {
  a.Program = function(b) {
    var a = [], c;
    for (c in b) {
      if ("Program" != b[c].type) {
        return;
      }
      var e = [], f = b[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c], g = this[g.type](g);
        console.log("result block", g);
        g && g.type && e.push(g);
      }
      console.log("thread", e);
      0 != e.length && a.push(e);
    }
    return a;
  };
  a.ExpressionStatement = function(b) {
    console.log("ExpressionStatement component", b);
    var a = {};
    b = b.expression;
    b.type && (b = this[b.type](b), console.log("ExpressionStatement expressionData", b), b.type && b.params ? (a.type = b.type, a.params = b.params, result = a) : b.type ? (a.type = b.type, result = a) : result = b);
    console.log("ExpressionStatement result", result);
    return result;
  };
  a.CallExpression = function(b) {
    console.log("CallExpression component", b);
    var a = {}, c, e, f = b.callee, g = this[f.type](f);
    console.log("CallExpression calleeData", g);
    arguments = b.arguments;
    if ("Identifier" == f.type) {
      console.log("CallExpression Identifier calleeData", g), a.callee = g;
    } else {
      var h = g.object, g = g.property;
      if (h.statements && "call" == g.name && 0 == g.userCode) {
        h = h.statements, console.log("CallExpression statement", h), a.statements = h;
      } else {
        var k = h.name ? String(h.name).concat(".").concat(String(g.name)) : h.object.name ? String(h.object.name).concat(".").concat(String(h.property.name)).concat(".").concat(String(g.name)) : null
      }
      console.log("CallExpression calleeName", k);
      h = this.getBlockType(k);
      console.log("CallExpression type before", h);
      "__pythonRuntime.functions.range" == k ? h = this.getBlockType("%1number#") : "__pythonRuntime.ops.add" == k ? (h = this.getBlockType("(%1 %2calc_basic# %3)"), g = {raw:"PLUS", type:"Literal", value:"PLUS"}, arguments.splice(1, 0, g)) : "__pythonRuntime.ops.multiply" == k ? (h = this.getBlockType("(%1 %2calc_basic# %3)"), g = {raw:"MULTI", type:"Literal", value:"MULTI"}, arguments.splice(1, 0, g)) : "__pythonRuntime.functions.len" == k && (h = this.getBlockType("len(%2)"));
      a.callee = k;
      console.log("CallExpression type after", h);
    }
    if (h) {
      var f = Entry.block[h], g = f.params, f = f.def.params, l = [];
      console.log("CallExpression component.arguments", arguments);
      console.log("CallExpression paramsMeta", g);
      console.log("CallExpression paramsDefMeta", f);
      for (var m in g) {
        var n = g[m].type;
        "Indicator" == n ? (n = {raw:null, type:"Literal", value:null}, m < arguments.length && arguments.splice(m, 0, n)) : "Text" == n && (n = {raw:"", type:"Literal", value:""}, m < arguments.length && arguments.splice(m, 0, n));
      }
      console.log("CallExpression arguments", arguments);
      for (var q in arguments) {
        m = arguments[q], console.log("CallExpression argument", m, "typeof", typeof m), m = this[m.type](m, g[q], f[q], !0), console.log("CallExpression param", m), "__pythonRuntime.functions.range" == k && m.type ? (h = m.type, l = m.params) : l.push(m);
      }
      h && (c = h);
      l && (e = l);
      c && (a.type = c);
      e && (a.params = e);
    } else {
      c = [];
      for (q in arguments) {
        m = arguments[q], console.log("CallExpression argument", m, "typeof", typeof m), g = this[m.type](m), console.log("CallExpression argumentData", g), c.push(g);
      }
      console.log("CallExpression args", c);
      a.arguments = c;
    }
    console.log("CallExpression Function Check result", a);
    a.arguments && a.arguments[0] && "__pythonRuntime.utils.createParamsObj" == a.arguments[0].callee && (h = this._funcMap.get(a.callee.name + a.arguments[0].arguments.length), a = {}, a.type = h);
    console.log("CallExpression result", a);
    return a;
  };
  a.Identifier = function(b, a, c) {
    console.log("Identifier component", b, "paramMeta", a, "paramDefMeta", c);
    a = {};
    a.name = b.name;
    if (!0 === b.userCode || !1 === b.userCode) {
      a.userCode = b.userCode;
    }
    if (c = this.getBlockType("%1")) {
      b = b.name;
      var e = Entry.block[c], f = e.params, g = e.def.params, e = [], h, k;
      for (k in f) {
        console.log("Identifiler paramsMeta, paramsDefMeta", f[k], g[k]), "Text" != f[k].type && (h = this["Param" + f[k].type](b, f[k], g[k]));
      }
      console.log("Identifiler param", h);
      if (!h || "undefined" == h) {
        console.log("check in");
        k = Entry.variableContainer.variables_;
        console.log("Identifiler entryVariables", k);
        for (var l in k) {
          if (f = k[l], f.name_ == b) {
            h = f.id_;
            break;
          }
        }
      }
      h && (a.type = c, e.push(h));
      0 != e.length && (a.params = e);
    }
    console.log("Identifiler result", a);
    return a;
  };
  a.VariableDeclaration = function(b) {
    console.log("VariableDeclaration component", b);
    var a = {declarations:[]}, c, e;
    b = b.declarations;
    for (var f in b) {
      var g = b[f], g = this[g.type](g);
      console.log("VariableDeclaration declarationData", g);
      g && a.declarations.push(g);
      g && g.type && (c = g.type);
      g && g.params && (e = g.params);
    }
    c && (a.type = c);
    e && (a.params = e);
    console.log("VariableDeclaration result", a);
    return a;
  };
  a.VariableDeclarator = function(b) {
    console.log("VariableDeclarator component", b);
    var a = {}, c;
    c = !1;
    var e = !0, f = b.id, g = b.init;
    if ("__params0" != f.name && "__formalsIndex0" != f.name && "__args0" != f.name) {
      if (g.callee && "__getParam0" == g.callee.name) {
        return a.name = f.name, a;
      }
      if (!f.name.includes("__filbert")) {
        var h;
        g.callee && (h = g.callee.object.object.name.concat(".").concat(g.callee.object.property.name).concat(".").concat(g.callee.property.name));
        if ("__pythonRuntime.objects.list" == h) {
          e = this[f.type](f);
          console.log("VariableDeclarator idData", e);
          a.id = e;
          var k = this[g.type](g);
          console.log("VariableDeclarator initData", k);
          a.init = k;
          var g = f.name, f = [], arguments = k.arguments, l;
          for (l in arguments) {
            k = {}, k.data = String(arguments[l].params[0]), f.push(k);
          }
          l = Entry.variableContainer.lists_;
          for (var m in l) {
            k = l[m], console.log("VariableDeclarator entryList", k), null === k.object_ && k.name_ == g && (console.log("Check VariableDeclarator Update List", k), console.log("Check VariableDeclarator array", f), list = {x:k.x_, y:k.y_, id:k.id_, visible:k.visible_, name:k.name_, isCloud:k.isClud_, width:k.width_, height:k.height_, array:f}, k.syncModel_(list), k.updateView(), Entry.variableContainer.updateList(), c = !0);
          }
          c || (list = {name:g, array:f, variableType:"list"}, console.log("VariableDeclarator list", list), Entry.variableContainer.addList(list), Entry.variableContainer.updateList());
        } else {
          l = f.name;
          "Literal" == g.type ? k = g.value : "Identifier" == g.type ? k = g.name : g.arguments && f.name != g.arguments[0].name ? k = NaN : e = !1;
          console.log("variable", l, "value", k);
          if (e) {
            c = !1;
            e = Entry.variableContainer.variables_;
            for (m in e) {
              h = e[m], console.log("VariableDeclarator entryVariable", h), null === h.object_ && h.name_ == l && (console.log("Check VariableDeclarator Update Variable"), l = {x:h.x_, y:h.y_, id:h.id_, visible:h.visible_, value:k, name:h.name_, isCloud:h.isClud_}, h.syncModel_(l), Entry.variableContainer.updateList(), c = !0);
            }
            c || (l = {name:l, value:k, variableType:"variable"}, console.log("VariableDeclarator variable", l), Entry.variableContainer.addVariable(l), Entry.variableContainer.updateList());
          }
          e = this[f.type](f);
          console.log("VariableDeclarator idData", e);
          a.id = e;
          k = this[g.type](g);
          console.log("VariableDeclarator initData", k);
          a.init = k;
          console.log("VariableDeclarator idData.name", e.name, "initData.params[0].name", k.params[0].name);
          c = [];
          "Literal" == g.type ? (e.params && e.params[0] ? c.push(e.params[0]) : c.push(e.name), c.push(k)) : k.params && k.params[0] && e.name == k.params[0].name ? (c.push(e.params[0]), c.push(k.params[2])) : (c.push(e.params[0]), c.push(k));
          console.log("VariableDeclarator init.type", g.type);
          "Literal" == g.type ? m = this.getBlockType("%1 = %2") : (console.log("VariableDeclarator idData.name", e.name, "initData.params[0].name", k.params[0].name), m = k.params && k.params[0] && e.name == k.params[0].name ? "%1 = %1 + %2" : "%1 = %2", m = this.getBlockType(m));
          a.type = m;
          a.params = c;
        }
        console.log("VariableDeclarator result", a);
        return a;
      }
    }
  };
  a.Literal = function(b, a, c, e) {
    console.log("Literal component", b, "paramMeta", a, "paramDefMeta", c, "aflag", e);
    e = b.value;
    console.log("Literal value", e);
    a || (a = {type:"Block"}, c || (c = "number" == typeof e ? {type:"number"} : {type:"text"}));
    if ("Indicator" == a.type) {
      return null;
    }
    if ("Text" == a.type) {
      return "";
    }
    console.log("Literal paramMeta", a, "paramDefMeta", c);
    null != b.value ? (a = this["Param" + a.type](e, a, c), console.log("Literal param", void 0)) : (a = [], c = this[b.left.type](b.left), a.push(c), a.push(b.operator), b = this[b.right.type](b.right), a.push(b));
    b = a;
    console.log("Literal result", b);
    return b;
  };
  a.ParamBlock = function(b, a, c) {
    console.log("ParamBlock value", b, "paramMeta", a, "paramDefMeta", c);
    a = {};
    var e = b, f = [];
    if (!0 === b) {
      return a.type = "True", a;
    }
    if (!1 === b) {
      return a.type = "False", a;
    }
    var g = Entry.block[c.type], h = g.params, g = g.def.params;
    if (h && 0 != h.length) {
      for (var k in h) {
        console.log("aaa", h[k], "bbb", g[k]), e = this["Param" + h[k].type](b, h[k], g[k]);
      }
    } else {
      e = b;
    }
    console.log("ParamBlock param", e);
    f.push(e);
    a.type = c.type;
    a.params = f;
    console.log("ParamBlock result", a);
    return a;
  };
  a.ParamAngle = function(b, a, c) {
    console.log("ParamAngle value, paramMeta, paramDefMeta", b, a, c);
    return b;
  };
  a.ParamTextInput = function(b, a, c) {
    console.log("ParamTextInput value, paramMeta, paramDefMeta", b, a, c);
    return b;
  };
  a.ParamColor = function(b, a, c) {
    console.log("ParamColor value, paramMeta, paramDefMeta", b, a, c);
    console.log("ParamColor result", b);
    return b;
  };
  a.ParamDropdown = function(b, a, c) {
    console.log("ParamDropdown value, paramMeta, paramDefMeta", b, a, c);
    var e;
    a = a.options;
    console.log("options", a);
    for (var f in a) {
      if (c = a[f], b == c[1]) {
        e = c[1];
        break;
      }
    }
    e && (e = String(e));
    console.log("ParamDropdown result", e);
    return e;
  };
  a.ParamDropdownDynamic = function(b, a, c) {
    console.log("ParamDropdownDynamic value, paramMeta, paramDefMeta", b, a, c);
    var e;
    if ("mouse" == b || "wall" == b || "wall_up" == b || "wall_down" == b || "wall_right" == b || "wall_left" == b) {
      return b;
    }
    a = a.options;
    console.log("ParamDropdownDynamic options", a);
    for (var f in a) {
      if (b == a[f][0]) {
        console.log("options[i][0]", a[f][0]);
        e = a[f][1];
        break;
      }
    }
    e && (e = String(e));
    console.log("ParamDropdownDynamic result", e);
    return e;
  };
  a.ParamKeyboard = function(b, a, c) {
    console.log("ParamKeyboard value, paramMeta, paramDefMeta", b, a, c);
    b = Entry.KeyboardCode.prototype.keyCharToCode[b];
    console.log("ParamKeyboard result", b);
    return b;
  };
  a.Indicator = function(b, a, c) {
  };
  a.MemberExpression = function(b) {
    console.log("MemberExpression component", b);
    var a = {}, c = b.object;
    b = b.property;
    c = this[c.type](c);
    a.object = c;
    var e = this[b.type](b);
    a.property = e;
    console.log("MemberExpression objectData", c);
    console.log("MemberExpression propertyData", e);
    var f = Entry.variableContainer.variables_;
    console.log("MemberExpression entryVariables", f);
    if ("call" == e.name && 0 == e.userCode) {
      return a;
    }
    var g;
    b = [];
    for (var h in f) {
      var k = f[h], l = Entry.container.getObject(k.object_);
      if (l && k.name_ == e && l.name == String(c)) {
        g = k.id_;
        break;
      }
    }
    g && b.push(g);
    g = this.getBlockType("%1");
    console.log("MemberExpression type", g);
    g && (a.type = g);
    0 != b.length && (a.params = b);
    console.log("MemberExpression result", a);
    return a;
  };
  a.WhileStatement = function(b) {
    console.log("WhileStatement component", b);
    var a;
    a = {statements:[]};
    var c = b.test;
    console.log("WhileStatement test", c);
    if (!0 === c.value) {
      var e = this.getBlockType("while True:\n$1")
    }
    console.log("WhileStatement type", e);
    var f = Entry.block[e].params;
    console.log("WhileStatement paramsMeta", f);
    var g = [];
    if ("Literal" == c.type || "Identifier" == c.type) {
      arguments = [];
      arguments.push(c);
      f = Entry.block[e].params;
      c = Entry.block[e].def.params;
      console.log("WhileStatement paramsMeta", f);
      console.log("WhileStatement paramsDefMeta", c);
      for (var h in f) {
        var k = f[h].type;
        "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (var l in arguments) {
        h = arguments[l], console.log("WhileStatement argument", h), h = this[h.type](h, f[l], c[l], !0), console.log("WhileStatement Literal param", h), h && null != h && g.push(h);
      }
    } else {
      h = this[c.type](c), console.log("WhileStatement Not Literal param", h), h && null != h && g.push(h);
    }
    f = b.body;
    f = this[f.type](f);
    console.log("WhileStatement bodyData", f);
    a.type = e;
    a.params = g;
    a.statements.push(f.statements);
    console.log("WhileStatement result", a);
    return a;
  };
  a.BlockStatement = function(b) {
    console.log("BlockStatement component", b);
    var a = {statements:[], data:[]}, c = [], e = [], f = [];
    b = b.body;
    console.log("BlockStatement bodies", b);
    for (var g in b) {
      var h = b[g], h = this[h.type](h);
      console.log("BlockStatement bodyData", h);
      h && null == h || (f.push(h), console.log("BlockStatement data", f));
    }
    console.log("BlockStatement final data", f);
    a.data = f;
    console.log("jhlee data check", f);
    for (var k in f) {
      if (f[1] && "repeat_basic" == f[1].type) {
        if (0 == k) {
          if (f[k].declarations) {
            b = f[0].declarations;
            for (k in b) {
              h = b[k], (h = h.init) && c.push(h);
            }
            a.params = c;
          }
        } else {
          if (1 == k) {
            a.type = f[k].type;
            e = [];
            b = f[k].statements[0];
            console.log("BlockStatement allStatements", b);
            if (b && 0 != b.length) {
              for (g in b) {
                h = b[g], console.log("BlockStatement(for) statement", h), h.type && e.push(h);
              }
            }
            console.log("BlockStatement(for) statements", e);
            a.statements.push(e);
          }
        }
      } else {
        if (f) {
          if (0 == k) {
            if (f[k] && f[k].declarations) {
              b = f[k].declarations;
              for (k in b) {
                h = b[k], (h = h.init) && c.push(h);
              }
              a.params = c;
            } else {
              (h = f[k]) && h.type && e.push(h);
            }
          } else {
            e = [];
            if ((b = f) && 0 != b.length) {
              for (g in b) {
                h = b[g], console.log("BlockStatement statement", h), h && h.type && e.push(h);
              }
            }
            console.log("BlockStatement statements", e);
          }
          a.statements = e;
        }
      }
    }
    console.log("BlockStatement statement result", a);
    return a;
  };
  a.IfStatement = function(b) {
    console.log("IfStatement component", b);
    var a;
    a = {statements:[]};
    var c, e = [], f = b.consequent, g = b.alternate;
    c = null != g ? "if_else" : "_if";
    a.type = c;
    console.log("IfStatement type", c);
    var h = b.test;
    console.log("IfStatement test", h);
    if ("Literal" == h.type || "Identifier" == h.type) {
      arguments = [];
      arguments.push(h);
      h = Entry.block[c].params;
      c = Entry.block[c].def.params;
      console.log("IfStatement paramsMeta", h);
      console.log("IfStatement paramsDefMeta", c);
      for (var k in h) {
        var l = h[k].type;
        "Indicator" == l ? (l = {raw:null, type:"Literal", value:null}, k < arguments.length && arguments.splice(k, 0, l)) : "Text" == l && (l = {raw:"", type:"Literal", value:""}, k < arguments.length && arguments.splice(k, 0, l));
      }
      for (var m in arguments) {
        k = arguments[m], console.log("IfStatement argument", k), k = this[k.type](k, h[m], c[m], !0), console.log("IfStatement Literal param", k), k && null != k && e.push(k);
      }
    } else {
      k = this[h.type](h), console.log("IfStatement Not Literal param", k), k && null != k && e.push(k);
    }
    e && 0 != e.length && (a.params = e);
    console.log("IfStatement params result", e);
    if (null != f) {
      e = [];
      console.log("IfStatement consequent", f);
      f = this[f.type](f);
      console.log("IfStatement consequent data", f);
      f = f.data;
      console.log("IfStatement consequentsData", f);
      for (m in f) {
        h = f[m], console.log("IfStatement consData", h), h.init && h.type ? (a.type = h.type, (h = h.statements) && (e = h)) : !h.init && h.type && e.push(h);
      }
      0 != e.length && (a.statements[0] = e);
    }
    if (null != g) {
      f = [];
      console.log("IfStatement alternate", g);
      g = this[g.type](g);
      console.log("IfStatement alternate data", g);
      g = g.data;
      for (m in g) {
        (e = g[m]) && e.type && f.push(e);
      }
      0 != f.length && (a.statements[1] = f);
    }
    console.log("IfStatement result", a);
    return a;
  };
  a.ForStatement = function(b) {
    console.log("ForStatement component", b);
    var a = {statements:[]}, c = this.getBlockType("for i in range(%1):\n$1");
    a.type = c;
    if (c = b.init) {
      var e = this[c.type](c)
    }
    a.init = e;
    console.log("ForStatement init", c);
    e = b.body.body;
    console.log("ForStatement bodies", e);
    if (e) {
      for (var f in e) {
        0 != f && (c = e[f], console.log("ForStatement bodyData", c, "index", f), c = this[c.type](c), console.log("ForStatement bodyData result", c, "index", f), a.statements.push(c));
      }
    }
    console.log("ForStatement bodyData result", a);
    if (f = b.test) {
      var g = this[f.type](f)
    }
    a.test = g;
    console.log("ForStatement testData", g);
    if (b = b.update) {
      var h = this[b.type](b)
    }
    a.update = h;
    console.log("ForStatement updateData", h);
    console.log("ForStatement result", a);
    return a;
  };
  a.ForInStatement = function(b) {
    console.log("ForInStatement component", b);
    console.log("ForInStatement result", null);
    return null;
  };
  a.BreakStatement = function(b) {
    console.log("BreakStatement component", b);
    b = {};
    var a = this.getBlockType("break");
    console.log("BreakStatement type", a);
    b.type = a;
    console.log("BreakStatement result", b);
    return b;
  };
  a.UnaryExpression = function(b) {
    console.log("UnaryExpression component", b);
    var a;
    b.prefix && (a = b.operator, b = b.argument, console.log("UnaryExpression operator", a), b.value = Number(a.concat(b.value)), a = this[b.type](b), console.log("UnaryExpression data", a));
    b = a;
    console.log("UnaryExpression result", b);
    return b;
  };
  a.LogicalExpression = function(b) {
    console.log("LogicalExpression component", b);
    var a;
    a = {};
    var c = String(b.operator);
    switch(c) {
      case "&&":
        var e = "(%1 and %3)";
        break;
      case "||":
        e = "(%1 or %3)";
        break;
      default:
        e = "(%1 and %3)";
    }
    var e = this.getBlockType(e), f = [], c = b.left;
    if ("Literal" == c.type || "Identifier" == c.type) {
      arguments = [];
      arguments.push(c);
      var c = Entry.block[e].params, g = Entry.block[e].def.params;
      console.log("LogicalExpression paramsMeta", c);
      console.log("LogicalExpression paramsDefMeta", g);
      for (var h in c) {
        var k = c[h].type;
        "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (var l in arguments) {
        var m = arguments[l];
        console.log("LogicalExpression argument", m);
        m = this[m.type](m, c[l], g[l], !0);
        console.log("LogicalExpression param", m);
        m && null != m && f.push(m);
      }
    } else {
      (m = this[c.type](c)) && f.push(m);
    }
    console.log("LogicalExpression left param", m);
    c = String(b.operator);
    console.log("LogicalExpression operator", c);
    c && (m = c = Entry.TextCodingUtil.prototype.logicalExpressionConvert(c), f.push(m));
    c = b.right;
    if ("Literal" == c.type || "Identifier" == c.type) {
      arguments = [];
      arguments.push(c);
      c = Entry.block[e].params;
      g = Entry.block[e].def.params;
      console.log("LogicalExpression paramsMeta", c);
      console.log("LogicalExpression paramsDefMeta", g);
      for (h in c) {
        k = c[h].type, "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (l in arguments) {
        m = arguments[l], console.log("LogicalExpression argument", m), m = this[m.type](m, c[l], g[l], !0), console.log("LogicalExpression param", m), m && null != m && f.push(m);
      }
    } else {
      (m = this[c.type](c)) && f.push(m);
    }
    console.log("LogicalExpression right param", m);
    a.type = e;
    a.params = f;
    console.log("LogicalExpression result", a);
    return a;
  };
  a.BinaryExpression = function(b) {
    console.log("BinaryExpression component", b);
    var a, c = {}, e = String(b.operator);
    switch(e) {
      case "==":
        var f = "(%1 %2boolean_compare# %3)";
        break;
      case "!=":
        f = "(%2 != True)";
        break;
      case "<":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case "<=":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case ">":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case ">=":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case "+":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "-":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "*":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "/":
        f = "(%1 %2calc_basic# %3)";
    }
    console.log("BinaryExpression operator", e);
    console.log("BinaryExpression syntax", f);
    if (f = this.getBlockType(f)) {
      console.log("BinaryExpression type", f);
      a = [];
      e = b.left;
      console.log("BinaryExpression left", e);
      if ("Literal" == e.type || "Identifier" == e.type) {
        arguments = [];
        arguments.push(e);
        var e = Entry.block[f].params, g = Entry.block[f].def.params;
        console.log("BinaryExpression paramsMeta", e);
        console.log("BinaryExpression paramsDefMeta", g);
        for (var h in e) {
          var k = e[h].type;
          "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
        }
        for (var l in arguments) {
          var m = arguments[l];
          console.log("BinaryExpression argument", m);
          m = this[m.type](m, e[l], g[l], !0);
          console.log("BinaryExpression param", m);
          m && null != m && a.push(m);
        }
      } else {
        (m = this[e.type](e)) && a.push(m);
      }
      console.log("BinaryExpression left params", a);
      if ("boolean_not" == f) {
        return a.splice(0, 0, ""), a.splice(2, 0, ""), console.log("BinaryExpression boolean_not params", a), c.type = f, c.params = a, c;
      }
      if (e = String(b.operator)) {
        console.log("BinaryExpression operator", e), (m = e = Entry.TextCodingUtil.prototype.binaryOperatorConvert(e)) && a.push(m);
      }
      e = b.right;
      if ("Literal" == e.type || "Identifier" == e.type) {
        arguments = [];
        arguments.push(e);
        e = Entry.block[f].params;
        g = Entry.block[f].def.params;
        console.log("BinaryExpression paramsMeta", e);
        console.log("BinaryExpression paramsDefMeta", g);
        for (h in e) {
          k = e[h].type, "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
        }
        for (l in arguments) {
          m = arguments[l], console.log("BinaryExpression argument", m), m = this[m.type](m, e[l], g[l], !0), console.log("BinaryExpression param", m), m && null != m && a.push(m);
        }
      } else {
        (m = this[e.type](e)) && a.push(m);
      }
      console.log("BinaryExpression right param", m);
      c.type = f;
      c.params = a;
    } else {
      return a;
    }
    console.log("BinaryExpression params", a);
    a = c;
    console.log("BinaryExpression result", a);
    return a;
  };
  a.UpdateExpression = function(b) {
    console.log("UpdateExpression", b);
    var a = {}, c = b.argument;
    if (c) {
      var e = this[c.type](c)
    }
    a.argument = e;
    a.operator = b.operator;
    a.prefix = b.prefix;
    console.log("UpdateExpression result", a);
    return a;
  };
  a.AssignmentExpression = function(b) {
    console.log("AssignmentExpression component", b);
    var a = {}, c, e = [], f, g = !1, h = b.left, k = this[h.type](h);
    console.log("AssignmentExpression leftData", k);
    a.left = k;
    operator = String(b.operator);
    console.log("AssignmentExpression operator", operator);
    switch(operator) {
      case "=":
        if ("MemberExpression" == h.type) {
          if (b.right.arguments) {
            c = b.left.object.name.concat(b.left.property.name);
            var l = b.right.arguments[0].object.name.concat(b.right.arguments[0].property.name);
            console.log("AssignmentExpression leftEx", c, "rightEx", l);
            l = b.right.arguments && c == l ? "%1 = %1 + %2" : "%1 = %2";
          } else {
            l = "%1 = %2";
          }
          c = this.getBlockType(l);
        }
      ;
    }
    if (operator) {
      var m = Entry.TextCodingUtil.prototype.logicalExpressionConvert(operator)
    }
    a.operator = m;
    b = b.right;
    if (b.type) {
      var n = this[b.type](b);
      console.log("AssignmentExpression rightData", n);
    }
    a.right = n;
    if ("MemberExpression" == h.type && "%1 = %2" == l) {
      l = !1;
      h = a.left.object;
      n = a.left.property;
      b = a.right.params[0];
      m = null;
      if (Entry.stage.selectedObject) {
        console.log("aa", Entry.stage.selectedObject, "bb", h), Entry.stage.selectedObject.name != String(h) ? m = null : (m = Entry.stage.selectedObject.id, l = !0);
      } else {
        k = Entry.container.objects_;
        console.log("target object", h, "containter object", k);
        for (var q in k) {
          var r = k[q];
          console.log("cotainer detail object", r, "target object", h);
          if (r.name == String(h)) {
            m = r.id;
            l = !0;
            break;
          }
        }
      }
      console.log("final currentObject", m);
      if (l) {
        q = Entry.variableContainer.variables_;
        for (var t in q) {
          if (l = q[t], console.log("AssignmentExpression entryVariable", l), k = Entry.container.getObject(l.object_)) {
            console.log("target object", k), l.name_ == n && k.name == String(h) && (console.log("Check AssignmentExpression Update Variable"), l.setValue(b), Entry.variableContainer.updateList(), g = !0);
          }
        }
        g || (variable = {name:n, value:b, object:m, variableType:"variable"}, console.log("AssignmentExpression variable", variable), Entry.variableContainer.addVariable(variable));
      }
      console.log("AssignmentExpression object", h, "property", n, "value", b);
      q = Entry.variableContainer.variables_;
      console.log("AssignmentExpression entryVariables", q);
      for (var u in q) {
        if (l = q[u], (k = Entry.container.getObject(l.object_)) && l.name_ == n && k.name == String(h)) {
          f = l.id_;
          break;
        }
      }
      if (!f) {
        return result = a;
      }
      e.push(f);
      e.push(a.right);
    } else {
      if ("MemberExpression" == h.type && "%1 = %1 + %2" == l) {
        console.log("data", a);
        h = a.left.object;
        n = a.left.property;
        q = Entry.variableContainer.variables_;
        console.log("AssignmentExpression entryVariables", q);
        for (u in q) {
          if (l = q[u], (k = Entry.container.getObject(l.object_)) && l.name_ == n && k.name == String(h)) {
            f = l.id_;
            break;
          }
        }
        e.push(f);
        e.push(a.right.params[2]);
      }
    }
    result = a;
    result.type = c;
    result.params = e;
    console.log("AssignmentExpression result", result);
    return result;
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration component", b);
    var a = {}, c = b.body;
    b = b.id;
    if ("__getParam0" == b.name) {
      return a;
    }
    var e = this[c.type](c);
    console.log("FunctionDeclaration bodyData", e);
    if ("Identifier" == b.type) {
      var f = this[b.type](b)
    }
    console.log("FunctionDeclaration idData", f);
    c = [];
    b = [];
    var f = f.name, e = e.data, g;
    for (g in e) {
      if (e[g].declarations) {
        var h = e[g].declarations;
        0 < h.length && c.push(h[0].name);
      } else {
        e[g].argument && (h = e[g].argument.statements) && 0 < h.length && (b = h);
      }
    }
    console.log("FunctionDeclaration textFuncName", f);
    console.log("FunctionDeclaration textFuncParams", c);
    console.log("FunctionDeclaration textFuncStatements", b);
    var k, l, m, e = Entry.variableContainer.functions_, n;
    for (n in e) {
      if (h = e[n], g = h.block.template.split("%")[0].trim(), f == g) {
        k = !0;
        console.log("textFuncName", f);
        console.log("blockFuncName", g);
        console.log("textFuncParams.length", c.length);
        console.log("Object.keys(blockFunc.paramMap).length", Object.keys(h.paramMap).length);
        if (c.length == Object.keys(h.paramMap).length) {
          for (l = !0, console.log("textFuncParams.length", c.length), console.log("Object.keys(blockFunc.paramMap).length", Object.keys(h.paramMap).length), k = h.content._data[0]._data, g = 1;g < k.length && l;g++) {
            l = !1;
            var q = k[g], r = b[g - 1];
            console.log("blockFuncContent", q);
            console.log("textFuncStatement", r);
            if (r.type == q.data.type) {
              l = !0;
              var r = r.params, q = q.data.params, t = [];
              q.map(function(b, a) {
                console.log("blockFuncContentParam", b);
                b && t.push(b);
              });
              q = t;
              console.log("textFuncStatementParams", r);
              console.log("blockFuncContentParams", q);
              if (r.length == q.length) {
                l = !0;
                for (var u = 0;u < r.length && l;u++) {
                  if (l = !1, r[u].name) {
                    for (var v in c) {
                      if (r[u].name == c[v]) {
                        console.log("textFuncStatementParams[j].name", r[u].name);
                        console.log("textFuncParams[k]", c[v]);
                        for (var x in h.paramMap) {
                          if (q[u].data.type == x && (console.log("blockFuncContentParams[j].data.type", q[u].data.type), console.log("bfcParam", x), h.paramMap[x] == v)) {
                            l = !0;
                            break;
                          }
                        }
                        if (l) {
                          break;
                        }
                      }
                    }
                  } else {
                    r[u].type && r[u].params[0] == q[u].data.params[0] && (l = !0, console.log("Function Param Found 1", r[u].params[0]), console.log("Function Param Found 2", q[u].data.params[0]));
                  }
                }
              } else {
                l = fasle;
                break;
              }
            } else {
              l = !1;
              break;
            }
          }
        } else {
          l = !1;
        }
        if (l) {
          m = "func".concat("_").concat(n);
          k = !0;
          break;
        } else {
          l = k = !1;
        }
      }
    }
    console.log("FunctionDeclaration foundFlag", k);
    console.log("FunctionDeclaration matchFlag", l);
    k ? (console.log("targetFuncId", m), this._funcMap.put(f + c.length, m), console.log("FunctionDeclaration this._funcMap", this._funcMap), a = m) : (l = new Entry.Func, l.generateBlock(!0), m = Entry.Func.requestParamBlock("string"), console.log("FunctionDeclaration stringParam", m), l.paramMap[m] = 0, console.log("FunctionDeclaration paramBlock", l), Entry.Func.generateWsBlock(l), c = [], b = [], Entry.variableContainer.saveFunction(l), Entry.variableContainer.updateList(), console.log("FunctionDeclaration newFunc", 
    l));
    console.log("FunctionDeclaration result", a);
  };
  a.FunctionExpression = function(b) {
    console.log("FunctionExpression component", b);
    var a = {};
    b = b.body;
    b = this[b.type](b);
    console.log("FunctionExpression bodyData", b);
    a.statements = b.statements;
    console.log("FunctionExpression result", a);
    return a;
  };
  a.ReturnStatement = function(b) {
    console.log("ReturnStatement component", b);
    var a = {};
    if (b = b.argument) {
      var c = this[b.type](b)
    }
    c && (a.argument = c);
    console.log("ReturnStaement result", a);
    return a;
  };
  a.ThisExpression = function(b) {
    console.log("ThisExpression component", b);
    var a = {};
    if (b = b.userCode) {
      a.userCode = b;
    }
    console.log("ThisExpression result", a);
    return a;
  };
  a.NewExpression = function(b) {
    console.log("NewExpression component", b);
    var a = {}, c = b.callee, c = this[c.type](c), arguments = b.arguments, e = [], f;
    for (f in arguments) {
      var g = arguments[f];
      console.log("NewExpression argument", g);
      g = this[g.type](g);
      e.push(g);
    }
    a.callee = c;
    a.arguments = e;
    console.log("NewExpression result", a);
    return a;
  };
  a.getBlockType = function(b) {
    return this.blockSyntax[b];
  };
  a.RegExp = function(b) {
    console.log("RegExp", b);
    console.log("RegExp result", b);
    return b;
  };
  a.Function = function(b) {
    console.log("Function component", b);
    console.log("Function result", b);
    return b;
  };
  a.EmptyStatement = function(b) {
    console.log("EmptyStatement component", b);
    console.log("EmptyStatement result", b);
    return b;
  };
  a.DebuggerStatement = function(b) {
    console.log("DebuggerStatement component", b);
    console.log("DebuggerStatement result", b);
    return b;
  };
  a.WithStatement = function(b) {
    console.log("WithStatement component", b);
    console.log("WithStatement result", b);
    return b;
  };
  a.LabeledStatement = function(b) {
    console.log("LabeledStatement component", b);
    console.log("LabeledStatement result", b);
    return b;
  };
  a.ContinueStatement = function(b) {
    console.log("ContinueStatement component", b);
    console.log("ContinueStatement result", b);
    return b;
  };
  a.SwitchStatement = function(b) {
    console.log("SwitchStatement component", b);
    console.log("SwitchStatement result", b);
    return b;
  };
  a.SwitchCase = function(b) {
    console.log("SwitchCase component", b);
    console.log("SwitchCase result", b);
    return b;
  };
  a.ThrowStatement = function(b) {
    console.log("ThrowStatement component", b);
    console.log("ThrowStatement result", b);
    return b;
  };
  a.TryStatement = function(b) {
    console.log("TryStatement component", b);
    console.log("TryStatement result", b);
    return b;
  };
  a.CatchClause = function(b) {
    console.log("CatchClause component", b);
    console.log("CatchClause result", b);
    return b;
  };
  a.DoWhileStatement = function(b) {
    console.log("DoWhileStatement component", b);
    console.log("DoWhileStatement result", b);
    return b;
  };
  a.ArrayExpression = function(b) {
    console.log("ArrayExpression component", b);
    console.log("ArrayExpression result", b);
    return b;
  };
  a.ObjectExpression = function(b) {
    console.log("ObjectExpression component", b);
    console.log("ObjectExpression result", b);
    return b;
  };
  a.Property = function(b) {
    console.log("Property component", b);
    console.log("Property result", b);
    return b;
  };
  a.ConditionalExpression = function(b) {
    console.log("ConditionalExpression component", b);
    console.log("ConditionalExpression result", b);
    return b;
  };
  a.SequenceExpression = function(b) {
    console.log("SequenceExpression component", b);
    console.log("SequenceExpression result", b);
    return b;
  };
})(Entry.PyToBlockParser.prototype);
Entry.Parser = function(a, b, d) {
  this._mode = a;
  this.syntax = {};
  this.codeMirror = d;
  this._lang = c || "js";
  this._type = b;
  this.availableCode = [];
  Entry.Parser.PARSE_SYNTAX = 0;
  Entry.Parser.PARSE_VARIABLE = 1;
  Entry.Parser.BLOCK_SKELETON_BASIC = "basic";
  Entry.Parser.BLOCK_SKELETON_BASIC_LOOP = "basic_loop";
  Entry.Parser.BLOCK_SKELETON_BASIC_DOUBLE_LOOP = "basic_double_loop";
  "maze" === a ? (this._stageId = Number(Ntry.configManager.getConfig("stageId")), this.setAvailableCode(NtryData.config[this._stageId].availableCode, NtryData.player[this._stageId].code)) : a === Entry.Vim.WORKSPACE_MODE && this.mappingSyntax(Entry.Vim.WORKSPACE_MODE);
  this.syntax.js = this.mappingSyntaxJs(a);
  this.syntax.py = this.mappingSyntaxPy(a);
  console.log("py syntax", this.syntax.py);
  switch(this._lang) {
    case "js":
      this._parser = new Entry.JsToBlockParser(this.syntax);
      var c = this.syntax, e = {}, f;
      for (f in c.Scope) {
        e[f + "();\n"] = c.Scope[f];
      }
      "BasicIf" in c && (e.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(b) {
        CodeMirror.showHint(b, null, {globalScope:e});
      };
      d.on("keyup", function(b, a) {
        !b.state.completionActive && 65 <= a.keyCode && 95 >= a.keyCode && CodeMirror.showHint(b, null, {completeSingle:!1, globalScope:e});
      });
      break;
    case "py":
      this._parser = new Entry.PyToBlockParser(this.syntax);
      c = this.syntax;
      e = {};
      for (f in c.Scope) {
        e[f + "();\n"] = c.Scope[f];
      }
      "BasicIf" in c && (e.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(b) {
        CodeMirror.showHint(b, null, {globalScope:e});
      };
      d.on("keyup", function(b, a) {
        !b.state.completionActive && 65 <= a.keyCode && 95 >= a.keyCode && CodeMirror.showHint(b, null, {completeSingle:!1, globalScope:e});
      });
      break;
    case "blockJs":
      this._parser = new Entry.BlockToJsParser(this.syntax);
      c = this.syntax;
      break;
    case "blockPy":
      this._parser = new Entry.BlockToPyParser(this.syntax), c = this.syntax;
  }
};
(function(a) {
  a.setParser = function(b, a, c) {
    b === Entry.Vim.MAZE_MODE && (this._stageId = Number(Ntry.configManager.getConfig("stageId")), this.setAvailableCode(NtryData.config[this._stageId].availableCode, NtryData.player[this._stageId].code));
    this.mappingSyntax(b);
    this._type = a;
    switch(a) {
      case Entry.Vim.PARSER_TYPE_JS_TO_BLOCK:
        this._parser = new Entry.JsToBlockParser(this.syntax);
        break;
      case Entry.Vim.PARSER_TYPE_PY_TO_BLOCK:
        this._parser = new Entry.PyToBlockParser(this.syntax.py);
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_JS:
        this._parser = new Entry.BlockToJsParser(this.syntax);
        b = this.syntax;
        for (var e in b.Scope) {
        }
        c.setOption("mode", {name:"javascript", globalVars:!0});
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_PY:
        this._parser = new Entry.BlockToPyParser(this.syntax.py), c.setOption("mode", {name:"python", globalVars:!0});
    }
  };
  a.parse = function(b, a) {
    console.log("PARSER TYPE", this._type);
    var c = null;
    switch(this._type) {
      case Entry.Vim.PARSER_TYPE_JS_TO_BLOCK:
        try {
          var e = (new Entry.JsAstGenerator).generate(b), c = this._parser.Program(e);
        } catch (m) {
          this.codeMirror && (m instanceof SyntaxError ? (c = {from:{line:m.loc.line - 1, ch:m.loc.column - 2}, to:{line:m.loc.line - 1, ch:m.loc.column + 1}}, m.message = "\ubb38\ubc95 \uc624\ub958\uc785\ub2c8\ub2e4.") : (c = this.getLineNumber(m.node.start, m.node.end), c.message = m.message, c.severity = "error", this.codeMirror.markText(c.from, c.to, {className:"CodeMirror-lint-mark-error", __annotation:c, clearOnEnter:!0})), Entry.toast.alert("Error", m.message)), c = [];
        }
        break;
      case Entry.Vim.PARSER_TYPE_PY_TO_BLOCK:
        try {
          var f = new Entry.PyAstGenerator;
          console.log("code", b);
          var g = b.split("\n\n");
          console.log("threads", g);
          for (var h in g) {
            console.log("thread", g[h]), console.log("search", g[h].search("import")), -1 != g[h].search("import") && g.splice(h, 1, "");
          }
          console.log("threads", g);
          b = [];
          for (var k in g) {
            var l = f.generate(g[k]);
            "Program" == l.type && 0 != l.body.length && b.push(l);
          }
          console.log("astArray", b);
          c = this._parser.Program(b);
          this._parser._variableMap.clear();
          console.log("result", c);
        } catch (m) {
          if (this.codeMirror) {
            throw Entry.toast.alert("[\ud14d\uc2a4\ud2b8\ucf54\ub529(\ud30c\uc774\uc36c) \uc624\ub958]", m.message), document.getElementById("entryCodingModeSelector").value = "2", m;
          }
          c = [];
        }
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_JS:
        c = this._parser.Code(b);
        c = c.match(/(.*{.*[\S|\s]+?}|.+)/g);
        c = Array.isArray(c) ? c.reduce(function(b, a, d) {
          1 === d && (b += "\n");
          return (-1 < a.indexOf("function") ? a + b : b + a) + "\n";
        }) : "";
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_PY:
        c = this._parser.Code(b, a), console.log("sf");
    }
    return c;
  };
  a.getLineNumber = function(b, a) {
    var c = this.codeMirror.getValue(), e = {from:{}, to:{}};
    b = c.substring(0, b).split(/\n/gi);
    e.from.line = b.length - 1;
    e.from.ch = b[b.length - 1].length;
    a = c.substring(0, a).split(/\n/gi);
    e.to.line = a.length - 1;
    e.to.ch = a[a.length - 1].length;
    return e;
  };
  a.mappingSyntax = function(b) {
    for (var a = Object.keys(Entry.block), c = 0;c < a.length;c++) {
      var e = a[c], f = Entry.block[e];
      if (f.mode === b && -1 < this.availableCode.indexOf(e) && (f = f.syntax)) {
        for (var g = this.syntax, h = 0;h < f.length;h++) {
          var k = f[h];
          if (h === f.length - 2 && "function" === typeof f[h + 1]) {
            g[k] = f[h + 1];
            break;
          }
          g[k] || (g[k] = {});
          h === f.length - 1 ? g[k] = e : g = g[k];
        }
      }
    }
  };
  a.setAvailableCode = function(b, a) {
    var c = [];
    b.forEach(function(b, a) {
      b.forEach(function(b, a) {
        c.push(b.type);
      });
    });
    a instanceof Entry.Code ? a.getBlockList().forEach(function(b) {
      b.type !== NtryData.START && -1 === c.indexOf(b.type) && c.push(b.type);
    }) : a.forEach(function(b, a) {
      b.forEach(function(b, a) {
        b.type !== NtryData.START && -1 === c.indexOf(b.type) && c.push(b.type);
      });
    });
    this.availableCode = this.availableCode.concat(c);
  };
  a.mappingSyntaxJs = function(b) {
    for (var a = Object.keys(Entry.block), c = 0;c < a.length;c++) {
      var e = a[c], f = Entry.block[e];
      if (f.mode === b && -1 < this.availableCode.indexOf(e) && (f = f.syntax)) {
        for (var g = this.syntax, h = 0;h < f.length;h++) {
          var k = f[h];
          if (h === f.length - 2 && "function" === typeof f[h + 1]) {
            g[k] = f[h + 1];
            break;
          }
          g[k] || (g[k] = {});
          h === f.length - 1 ? g[k] = e : g = g[k];
        }
      }
    }
    return g;
  };
  a.mappingSyntaxPy = function(b) {
    if (b == Entry.Vim.WORKSPACE_MODE) {
      b = {};
      var a = Entry.block, c;
      for (c in a) {
        var e = a[c], f = null;
        e.syntax && e.syntax.py && (f = e.syntax.py);
        f && (f = String(f), f.match(/.*\..*\)/) && (e = f.indexOf("("), f = f.substring(0, e)), b[f] = c);
      }
      return b;
    }
  };
})(Entry.Parser.prototype);
Entry.PyBlockAssembler = function(a) {
  this.blockSyntax = a;
  this._blockStatmentIndex = 0;
  this._blockStatments = [];
};
(function(a) {
  a.Program = function(b) {
    var a = [], c;
    for (c in b) {
      if ("Program" != b[c].type) {
        return;
      }
      var e = [], f = b[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c], g = this[g.type](g);
        console.log("checkitout", g);
        g = this._assembler[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      a.push(e);
    }
    return a;
  };
  a.ExpressionStatement = function(b) {
    console.log("ExpressionStatement component", b);
    var a = {};
    b = b.expression;
    "Literal" == b.type ? (b = this[b.type]({type:"Block", accept:"booleanMagnet"}, b), a.type = b.type, result = a, console.log("ExpressionStatement type literal", result)) : (b = this[b.type](b), a.type = b.type, a.params = b.params, result = a, console.log("ExpressionStatement type not literal", result));
    console.log("ExpressionStatement result", result);
    return result;
  };
  a.AssignmentExpression = function(b) {
    console.log("AssignmentExpression component", b);
    var a = [], c;
    c = b.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](paramsMeta[0], c), console.log("AssignmentExpression left Literal param", c)) : c = this[c.type](c), c && a.push(c), console.log("AssignmentExpression left param", c)) : (c = b.left, this[c.type](c));
    operator = String(b.operator);
    console.log("AssignmentExpression operator", operator);
    operator && (c = operator = Entry.TextCodingUtil.prototype.logicalExpressionConvert(operator), a.push(c));
    c = b.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](paramsMeta[2], c), console.log("AssignmentExpression right Literal param", c)) : c = this[c.type](c), c && a.push(c), console.log("AssignmentExpression right param", c)) : (c = b.right, this[c.type](c));
    console.log("AssignmentExpression params", a);
    console.log("AssignmentExpression result", result);
    return result;
  };
  a.CallExpression = function(b) {
    console.log("CallExpression component", b);
    var a;
    a = {};
    var c = b.callee, c = this[c.type](c);
    console.log("CallExpression calleeData", c, "calleeData typeof", typeof c);
    var e = "object" != typeof c.object ? String(c.object).concat(".").concat(String(c.property)) : String(c.object.object).concat(".").concat(String(c.object.property)).concat(".").concat(String(c.property));
    console.log("CallExpression syntax", e);
    c = this.getBlockType(e);
    console.log("CallExpression type1", c);
    c || "__pythonRuntime.functions.range" == e && (c = "repeat_basic");
    console.log("CallExpression type2", c);
    e = Entry.block[c].params;
    console.log("CallExpression paramsMeta", e);
    var arguments = b.arguments, f = [], g;
    for (g in arguments) {
      var h = arguments[g];
      console.log("CallExpression argument", h);
      if ("Literal" == h.type) {
        var k = e[g];
        "Indicator" == k.type ? (h = null, f.push(h), g--) : (console.log("CallExpression argument index", h.type, g), h = this[h.type](k, h, c, g), f.push(h));
        g == arguments.length - 1 && (console.log("CallExpression in1"), g < e.length && (console.log("CallExpression in2"), f.push(null)));
        console.log("CallExpression i", g);
      }
    }
    console.log("CallExpression params", f);
    a.type = c;
    a.params = f;
    console.log("CallExpression result", a);
    return a;
  };
  a.Literal = function(b, a, c, e) {
    console.log("Literal paramMeta component particularIndex blockType", b, a, c, e);
    a = a.value;
    b = c ? this["Param" + b.type](b, a, c, e) : this["Param" + b.type](b, a);
    console.log("Literal result", b);
    return b;
  };
  a.ParamColor = function(b, a) {
    console.log("ParamColor paramMeta value", b, a);
    console.log("ParamColor result", a);
    return a;
  };
  a.ParamDropdown = function(b, a) {
    console.log("ParamDropdown paramMeta value", b, a);
    console.log("ParamDropdownDynamic result", a);
    return a;
  };
  a.ParamDropdownDynamic = function(b, a) {
    console.log("ParamDropdownDynamic paramMeta value", b, a);
    var c;
    if ("mouse" == a) {
      return "mouse";
    }
    b = b.options;
    for (var e in b) {
      if (console.log("options", b), a == b[e][0]) {
        console.log("options[i][0]", b[e][0]);
        c = b[e][1];
        break;
      }
    }
    console.log("ParamDropdownDynamic result", c);
    return c;
  };
  a.ParamKeyboard = function(b, a) {
    console.log("ParamKeyboard paramMeta value", b, a);
    b = Entry.KeyboardCodeMap.prototype.keyCharToCode[a];
    console.log("ParamKeyboard result", b);
    return b;
  };
  a.ParamBlock = function(b, a, c, e) {
    console.log("ParamBlock paramMeta value blockType", b, a, c, e);
    var f = {}, g = [];
    c = Entry.TextCodingUtil.prototype.particularParam(c);
    if (null != c) {
      var h = c[e];
      if (h) {
        h = c[e];
        console.log("ParamBlock particularType", h);
        e = h;
        f.type = e;
        c = Entry.block[e].params;
        console.log("ParamBlock particular block paramsMeta", b);
        var k, l;
        for (l in c) {
          b = c[l];
          b = b.options;
          for (var m in b) {
            h = b[m], a == h[0] && (k = h[1]);
          }
        }
        g.push(k);
        f.params = g;
      } else {
        switch(e = typeof a, e) {
          case "number":
            f.type = "number";
            g.push(a);
            f.params = g;
            break;
          case "boolean":
            1 == a ? f.type = "True" : 0 == a && (f.type = "False");
            break;
          default:
            f.type = "text", g.push(a), f.params = g;
        }
      }
    } else {
      switch(e = typeof a, e) {
        case "number":
          f.type = "number";
          g.push(a);
          f.params = g;
          break;
        case "boolean":
          1 == a ? f.type = "True" : 0 == a && (f.type = "False");
          break;
        default:
          f.type = "text", g.push(a), f.params = g;
      }
    }
    console.log("ParamBlock valueType", e);
    console.log("ParamBlock result", f);
    return f;
  };
  a.Indicator = function(b, a, c) {
  };
  a.MemberExpression = function(b) {
    console.log("MemberExpression component", b);
    var a = {}, c = b.object;
    b = b.property;
    c = this[c.type](c);
    b = this[b.type](b);
    console.log("MemberExpression objectData", c);
    console.log("MemberExpression structure", b);
    a.object = c;
    a.property = b;
    console.log("MemberExpression result", a);
    return a;
  };
  a.Identifier = function(b) {
    console.log("Identifiler component", b);
    b = b.name;
    console.log("Identifiler result", b);
    return b;
  };
  a.WhileStatement = function(b) {
    console.log("WhileStatement component", b);
    var a = {}, c = b.test, e;
    1 == c.value && (e = this.getBlockType("while True:\n$1"));
    console.log("WhileStatement type", e);
    var f = Entry.block[e].params;
    console.log("WhileStatement paramsMeta", f);
    var g = [];
    c && (c.type = "Literal", f = f[0], c = "Indicator" == f.type ? null : this[c.type](f, c), g.push(c));
    c = [];
    b = b.body.body;
    for (var h in b) {
      f = b[h], f = this[f.type](f), c.push(f);
    }
    a.type = e;
    a.params = g;
    a.statements = [];
    a.statements.push(c);
    console.log("WhileStatement result", a);
    return a;
  };
  a.BlockStatement = function(b) {
    console.log("BlockStatement component", b);
    this._blockStatmentIndex = 0;
    this._blockStatments = [];
    var a = {};
    b = b.body;
    for (var c in b) {
      var e = b[c];
      console.log("BlockStatement body", e, "i", c);
      e = this[e.type](e);
      console.log("BlockStatement bodyData", e, "i", c);
      if (e.declarations) {
        console.log("BlockStatement statements type params bodyData", c, e);
        var e = e.declarations, f;
        for (f in e) {
          var g = e[f];
          g.init.type && (a.type = g.init.type);
          g.init.params && (console.log("BlockStatement params", g.init.params), a.params = g.init.params);
          console.log("BlockStatement structure", a, "j", f);
        }
      } else {
        0 == this._blockStatmentIndex && this._blockStatments.push(e);
      }
    }
    a.statements = [this._blockStatments];
    console.log("BlockStatement result", a);
    this._blockStatmentIndex++;
    return a;
  };
  a.IfStatement = function(b) {
    console.log("IfStatement component", b);
    var a = {}, c = [], e = [], f = [], g = [], h = b.test, k = b.alternate, l = b.consequent;
    b = this.getBlockType(null == k ? "if %1:\n$1" : "if %1:\n$1\nelse:\n$2");
    if (null != h) {
      var m = Entry.block[b].params;
      console.log("IfStatement paramsMeta", m);
      c = [];
      h.type = "Literal";
      m = m[0];
      h = "Indicator" == m.type ? null : this[h.type](m, h);
      c.push(h);
    }
    if (null != l) {
      for (var n in l.body) {
        if (h = l.body[n]) {
          h = this[h.type](h), console.log("IfStatement consequent bodyData", h), e.push(h);
        }
      }
    }
    if (null != k) {
      for (n in k.body) {
        if (h = k.body[n]) {
          h = this[h.type](h), console.log("IfStatement alternate bodyData", h), f.push(h);
        }
      }
    }
    0 != e.length && g.push(e);
    0 != f.length && g.push(f);
    a.type = b;
    0 != c.length && (a.params = c);
    0 != g.length && (a.statements = g);
    console.log("IfStatement result", a);
    return a;
  };
  a.VariableDeclaration = function(b) {
    console.log("VariableDeclaration component", b);
    var a = {}, c = [];
    b = b.declarations;
    for (var e in b) {
      var f = b[e], f = this[f.type](f);
      console.log("VariableDeclaration declarationData", f);
      c.push(f);
    }
    a.declarations = c;
    console.log("VariableDeclaration result", a);
    return a;
  };
  a.VariableDeclarator = function(b) {
    console.log("VariableDeclarator component", b);
    var a = {}, c = b.id, e = this[c.type](c);
    console.log("VariableDeclarator idData", e);
    b = b.init;
    b = this[b.type](b);
    console.log("VariableDeclarator initData", b);
    a.id = c;
    a.init = b;
    console.log("VariableDeclarator result", a);
    return a;
  };
  a.BreakStatement = function(b) {
    console.log("BreakStatement component", b);
    b = {};
    var a = this.getBlockType("break");
    b.type = a;
    console.log("BreakStatement result", b);
    return b;
  };
  a.UnaryExpression = function(b) {
    console.log("UnaryExpression component", b);
    var a = [];
    b.prefix && (b = b.operator.concat(b.argument.value), a.push(b));
    result.params = a;
    console.log("UnaryExpression result", result);
    return result;
  };
  a.LogicalExpression = function(b) {
    console.log("LogicalExpression component", b);
    var a = {}, c = String(b.operator);
    switch(c) {
      case "&&":
        var e = "%1 and %3";
        break;
      case "||":
        e = "%1 or %3";
        break;
      default:
        e = "%1 and %3";
    }
    var e = this.getBlockType(e), f = Entry.block[e].params;
    console.log("LogicalExpression paramsMeta", f);
    var g = [], c = b.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[0], c), console.log("LogicalExpression left Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("LogicalExpression left param", c)) : (c = b.left, this[c.type](c));
    c = String(b.operator);
    console.log("LogicalExpression operator", c);
    c && (c = Entry.TextCodingUtil.prototype.logicalExpressionConvert(c), g.push(c));
    c = b.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[2], c), console.log("LogicalExpression right Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("LogicalExpression right param", c)) : (c = b.right, this[c.type](c));
    a.type = e;
    a.params = g;
    console.log("LogicalExpression result", a);
    return a;
  };
  a.BinaryExpression = function(b) {
    console.log("BinaryExpression component", b);
    var a = {params:[]}, c = String(b.operator);
    console.log("BinaryExpression operator", c);
    if (c) {
      var e = "(%1 %2 %3)"
    }
    console.log("BinaryExpression syntax", e);
    e = this.getBlockType(e);
    console.log("BinaryExpression type", e);
    var f = Entry.block[e].params;
    console.log("BinaryExpression paramsMeta", f);
    var g = [], c = b.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[0], c), console.log("BinaryExpression left Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("BinaryExpression left param", c)) : (c = b.left, this[c.type](c));
    if (c = String(b.operator)) {
      console.log("BinaryExpression operator", c), (c = Entry.TextCodingUtil.prototype.binaryOperatorConvert(c)) && g.push(c);
    }
    c = b.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[2], c), console.log("BinaryExpression right Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("BinaryExpression right param", c)) : (c = b.right, this[c.type](c));
    console.log("BinaryExpression params", g);
    a.type = e;
    a.params = g;
    console.log("BinaryExpression result", a);
    return a;
  };
  a.getBlockType = function(b) {
    return this.blockSyntax[b];
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration component", b);
    console.log("FunctionDeclaration result", void 0);
    return b;
  };
  a.RegExp = function(b) {
    console.log("RegExp", b);
    console.log("RegExp result", void 0);
    return b;
  };
  a.Function = function(b) {
    console.log("Function", b);
    console.log("Function result", void 0);
    return b;
  };
  a.EmptyStatement = function(b) {
    console.log("EmptyStatement", b);
    console.log("EmptyStatement result", void 0);
    return b;
  };
  a.DebuggerStatement = function(b) {
    console.log("DebuggerStatement", b);
    console.log("DebuggerStatement result", void 0);
    return b;
  };
  a.WithStatement = function(b) {
    console.log("WithStatement", b);
    console.log("WithStatement result", void 0);
    return b;
  };
  a.ReturnStaement = function(b) {
    console.log("ReturnStaement", b);
    console.log("ReturnStaement result", void 0);
    return b;
  };
  a.LabeledStatement = function(b) {
    console.log("LabeledStatement", b);
    console.log("LabeledStatement result", void 0);
    return b;
  };
  a.BreakStatement = function(b) {
    console.log("BreakStatement", b);
    console.log("BreakStatement result", void 0);
    return b;
  };
  a.ContinueStatement = function(b) {
    console.log("ContinueStatement", b);
    console.log("ContinueStatement result", void 0);
    return b;
  };
  a.SwitchStatement = function(b) {
    console.log("SwitchStatement", b);
    console.log("SwitchStatement result", void 0);
    return b;
  };
  a.SwitchCase = function(b) {
    console.log("SwitchCase", b);
    console.log("SwitchCase result", void 0);
    return b;
  };
  a.ThrowStatement = function(b) {
    console.log("ThrowStatement", b);
    console.log("ThrowStatement result", void 0);
    return b;
  };
  a.TryStatement = function(b) {
    console.log("TryStatement", b);
    console.log("TryStatement result", void 0);
    return b;
  };
  a.CatchClause = function(b) {
    console.log("CatchClause", b);
    console.log("CatchClause result", void 0);
    return b;
  };
  a.DoWhileStatement = function(b) {
    console.log("DoWhileStatement", b);
    console.log("DoWhileStatement result", void 0);
    return b;
  };
  a.ForInStatement = function(b) {
    console.log("ForInStatement", b);
    console.log("ForInStatement result", void 0);
    return b;
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration", b);
    console.log("FunctionDeclaration result", void 0);
    return b;
  };
  a.ThisExpression = function(b) {
    console.log("ThisExpression", b);
    console.log("ThisExpression result", void 0);
    return b;
  };
  a.ArrayExpression = function(b) {
    console.log("ArrayExpression", b);
    console.log("ArrayExpression result", void 0);
    return b;
  };
  a.ObjectExpression = function(b) {
    console.log("ObjectExpression", b);
    console.log("ObjectExpression result", void 0);
    return b;
  };
  a.Property = function(b) {
    console.log("Property", b);
    console.log("Property result", void 0);
    return b;
  };
  a.FunctionExpression = function(b) {
    console.log("FunctionExpression", b);
    console.log("FunctionExpression result", void 0);
    return b;
  };
  a.UpdateExpression = function(b) {
    console.log("UpdateExpression", b);
    console.log("UpdateExpression result", void 0);
    return b;
  };
  a.ConditionalExpression = function(b) {
    console.log("ConditionalExpression", b);
    console.log("ConditionalExpression result", void 0);
    return b;
  };
  a.NewExpression = function(b) {
    console.log("NewExpression", b);
    console.log("NewExpression result", void 0);
    return b;
  };
  a.SequenceExpression = function(b) {
    console.log("SequenceExpression", b);
    console.log("SequenceExpression result", void 0);
    return b;
  };
})(Entry.PyBlockAssembler.prototype);
Entry.PyToBlockParserTemp = function(a) {
  this._assembler = new Entry.PyBlockAssembler(a);
};
(function(a) {
  a.Program = function(b) {
    var a = [], c;
    for (c in b) {
      if ("Program" != b[c].type) {
        return;
      }
      var e = [], f = b[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c], g = this[g.type](g);
        console.log("checkitout", g);
        g = this._assembler[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      a.push(e);
    }
    return a;
  };
  a.Identifier = function(b) {
    console.log("Identifier", b);
    return {type:b.type, name:b.name};
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration", b);
    var a = this[b.id.type](b.id);
    return {type:b.type, id:a};
  };
  a.Literal = function(b) {
    console.log("Literal", b);
    console.log("typeof node at Literal", typeof b.value);
    var a;
    "string" === typeof b.value ? a = b.value : "boolean" === typeof b.value ? a = b.value : "number" === typeof b.value ? a = b.value : "RegExp" === typeof b.value ? (a = this[typeof b.value](b), a = a.regex.pattern) : a = null;
    console.log("value", a);
    return {type:b.type, value:a};
  };
  a.RegExp = function(b) {
    console.log("RegExp", b);
    return {regex:b.regex};
  };
  a.Function = function(b) {
    console.log("Function", b);
    var a = this[b.id](b), c = [], e;
    for (e in b.params) {
      c.push(b.params[e]);
    }
    b = this[b.body](b);
    return {id:a, params:c, body:b};
  };
  a.ExpressionStatement = function(b) {
    var a = this[b.expression.type](b.expression);
    return {type:b.type, expression:a};
  };
  a.BlockStatement = function(b) {
    console.log("BlockStatement", b);
    var a = [], c;
    for (c in b.body) {
      var e = b.body[c];
      console.log("BlockStatement statement", e);
      e = this[e.type](e);
      console.log("BlockStatement body", e);
      a.push(e);
    }
    console.log("bodies", a);
    return {type:b.type, body:a};
  };
  a.EmptyStatement = function(b) {
    console.log("EmptyStatement", b);
    return {type:b.type};
  };
  a.DebuggerStatement = function(b) {
    console.log("DebuggerStatement", b);
    return {type:b.type};
  };
  a.WithStatement = function(b) {
    console.log("WithStatement", b);
    var a = this[b.object.type](b.object), c = this[b.body.type](b.body);
    return {type:b.type, object:a, body:c};
  };
  a.ReturnStaement = function(b) {
    console.log("ReturnStaement", b);
    var a;
    a = null === b.argument ? null : this[b.argument.type](b.argument);
    return {type:b.type, argument:a};
  };
  a.LabeledStatement = function(b) {
    console.log("LabeledStatement", b);
    var a = this[b.label.type](b.label), c = this[b.body.type](b.body);
    return {type:b.type, label:a, body:c};
  };
  a.BreakStatement = function(b) {
    console.log("BreakStatement", b);
    var a;
    console.log("node.label", b.label);
    b.label && null !== b.label ? (console.log("node.label2", b.label), a = this[b.label.type](b.label)) : (console.log("node.lable1", b.label), a = null);
    console.log("label", a);
    return {type:b.type, label:a};
  };
  a.ContinueStatement = function(b) {
    console.log("ContinueStatement", b);
    var a;
    a = null === b.label ? null : this[b.label.type](b.label);
    return {type:b.type, label:a};
  };
  a.IfStatement = function(b) {
    console.log("IfStatement", b);
    var a = this[b.test.type](b.test), c = {body:[]};
    if (null === b.alternate) {
      c = null;
    } else {
      for (var e in b.alternate.body) {
        var f = b.alternate.body[e], g = this[f.type](f);
        c.body.push(g);
      }
    }
    g = {body:[]};
    for (e in b.consequent.body) {
      f = b.consequent.body[e], f = this[f.type](f), g.body.push(f);
    }
    console.log("alternate", c);
    console.log("consequent", g);
    return {type:b.type, test:a, consequent:g, alternate:c};
  };
  a.SwitchStatement = function(b) {
    console.log("SwitchStatement", b);
    var a = this[b.discriminant.type](b.discriminant), c = [], e;
    for (e in b.cases) {
      var f = b.cases[e], f = this[f.type](f);
      c.push(f);
    }
    return {type:b.type, discriminant:a, cases:c};
  };
  a.SwitchCase = function(b) {
    console.log("SwitchCase", b);
    var a;
    a = null === b.test ? null : this[b.test.type](b.test);
    for (var c in b.consequent) {
      b = this[statment.type](statment), (void 0).push(b);
    }
    return {test:a, consequent:void 0};
  };
  a.ThrowStatement = function(b) {
    console.log("ThrowStatement", b);
    var a = this[b.argument.type](b.argument);
    return {type:b.type, argument:a};
  };
  a.TryStatement = function(b) {
    console.log("TryStatement", b);
    var a = this[b.block.type](b.block), c;
    c = null === b.handler ? null : this[b.handler.type](b.handler);
    var e;
    e = null === b.finalizer ? null : this[b.finalizer.type](b.finalizer);
    return {type:b.type, block:a, handler:c, finalizer:e};
  };
  a.CatchClause = function(b) {
    console.log("CatchClause", b);
    var a = b.param;
    b = this[b.body.type](b.body);
    return {param:a, body:b};
  };
  a.WhileStatement = function(b) {
    console.log("WhileStatement", b);
    var a = this[b.test.type](b.test), c = this[b.body.type](b.body);
    console.log("WhileStatement test", a);
    console.log("WhileStatement body", c);
    return {type:b.type, test:a, body:c};
  };
  a.DoWhileStatement = function(b) {
    console.log("DoWhileStatement", b);
    var a;
    a = this[b.init.type](b.init);
    var c;
    c = null === b.test ? null : this[b.test.type](b.test);
    var e;
    e = null === b.update ? null : this[b.update.type](b.update);
    var f = this[b.body.type](b.body);
    return {type:b.type, init:a, test:c, update:e, body:f};
  };
  a.ForStatement = function(b) {
    console.log("ForStatement", b);
    var a;
    if (null === b.init) {
      a = null;
    } else {
      this[b.init.type](b.init);
    }
    var c;
    c = null === b.test ? null : this[b.test.type](b.test);
    var e;
    e = null === b.update ? null : this[b.update.type](b.update);
    var f = this[b.body.type](b.body);
    console.log("ForStatement body", f);
    return {type:b.type, init:a, test:c, update:e, body:f};
  };
  a.ForInStatement = function(b) {
    console.log("ForInStatement", b);
    var a;
    a = this[b.left.type](b.left);
    var c = this[b.right.type](b.right), e = this[b.body.type](b.body);
    return {type:b.type, left:a, right:c, body:e};
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration", b);
    return {id:this[b.id.type](b.id)};
  };
  a.VariableDeclaration = function(b) {
    console.log("VariableDeclaration", b);
    var a = [], c;
    for (c in b.declarations) {
      var e = b.declarations[c], e = this[e.type](e);
      console.log("declaration", e);
      a.push(e);
    }
    console.log("VariableDeclaration declarations", a);
    return {type:b.type, declarations:a, kind:"var"};
  };
  a.VariableDeclarator = function(b) {
    console.log("VariableDeclarator", b);
    var a = this[b.id.type](b.id), c;
    c = null === b.init ? null : this[b.init.type](b.init);
    console.log("id", a);
    console.log("init", c);
    return {type:b.type, id:a, init:c};
  };
  a.ThisExpression = function(b) {
    console.log("ThisExpression", b);
    return {type:b.type};
  };
  a.ArrayExpression = function(b) {
    console.log("ArrayExpression", b);
    var a;
    if (null === b.elements) {
      a = null;
    } else {
      for (var c in b.elements) {
        var e = b.elements[c], e = this[e.type](e);
        a.push(e);
      }
    }
    return {type:b.type, elements:a};
  };
  a.ObjectExpression = function(b) {
    console.log("ObjectExpression", b);
    for (var a in b.properties) {
      var c = b.properties[a], c = this[c.type](c);
      (void 0).push(c);
    }
    return {type:b.type, properties:void 0};
  };
  a.Property = function(b) {
    console.log("Property", b);
    var a = this[b.key.type](b.key), c = this[b.value.type](b.value);
    return {type:b.type, key:a, value:c, kind:b.kind};
  };
  a.FunctionExpression = function(b) {
    console.log("FunctionExpression", b);
    return {type:b.type};
  };
  a.UnaryExpression = function(b) {
    console.log("UnaryExpression", b);
    var a;
    switch(b.operator) {
      case "-":
        a = b.operator;
        break;
      case "+":
        a = b.operator;
        break;
      case "!":
        a = b.operator;
        break;
      case "~":
        a = b.operator;
        break;
      case "typeof":
        a = b.operator;
        break;
      case "void":
        a = b.operator;
        break;
      case "delete":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var c = b.prefix, e = this[b.argument.type](b.argument);
    return {type:b.type, operator:a, prefix:c, argument:e};
  };
  a.UpdateExpression = function(b) {
    console.log("UpdateExpression", b);
    var a;
    switch(b.operator) {
      case "++":
        a = b.operator;
        break;
      case "--":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var c = this[b.argument.type](b.argument);
    return {type:b.type, operator:a, prefix:b.prefix, argument:c};
  };
  a.BinaryExpression = function(b) {
    console.log("BinaryExpression", b);
    var a;
    switch(b.operator) {
      case "==":
        a = b.operator;
        break;
      case "!=":
        a = b.operator;
        break;
      case "===":
        a = b.operator;
        break;
      case "!==":
        a = b.operator;
        break;
      case "<":
        a = b.operator;
        break;
      case "<=":
        a = b.operator;
        break;
      case ">":
        a = b.operator;
        break;
      case ">=":
        a = b.operator;
        break;
      case "<<":
        a = b.operator;
        break;
      case ">>":
        a = b.operator;
        break;
      case ">>>":
        a = b.operator;
        break;
      case "+":
        a = b.operator;
        break;
      case "-":
        a = b.operator;
        break;
      case "*":
        a = b.operator;
        break;
      case "/":
        a = b.operator;
        break;
      case "%":
        a = b.operator;
        break;
      case "|":
        a = b.operator;
        break;
      case "^":
        a = b.operator;
        break;
      case "|":
        a = b.operator;
        break;
      case "&":
        a = b.operator;
        break;
      case "in":
        a = b.operator;
        break;
      case "instanceof":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var c = this[b.left.type](b.left), e = this[b.right.type](b.right);
    return {type:b.type, operator:a, left:c, right:e};
  };
  a.AssignmentExpression = function(b) {
    console.log("AssignmentExpression", b);
    var a;
    switch(b.operator) {
      case "=":
        a = b.operator;
        break;
      case "+=":
        a = b.operator;
        break;
      case "-=":
        a = b.operator;
        break;
      case "*=":
        a = b.operator;
        break;
      case "/=":
        a = b.operator;
        break;
      case "%=":
        a = b.operator;
        break;
      case "<<=":
        a = b.operator;
        break;
      case ">>=":
        a = b.operator;
        break;
      case "|=":
        a = b.operator;
        break;
      case "^=":
        a = b.operator;
        break;
      case "&=":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var c;
    c = b.left;
    var e = this[b.right.type](b.right);
    return {type:b.type, operator:a, left:c, right:e};
  };
  a.LogicalExpression = function(b) {
    console.log("LogicalExpression", b);
    var a;
    switch(b.operator) {
      case "||":
        a = b.operator;
        break;
      case "&&":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var c = this[b.left.type](b.left), e = this[b.right.type](b.right);
    return {type:b.type, operator:a, left:c, right:e};
  };
  a.MemberExpression = function(b) {
    console.log("MemberExpression", b);
    var a = this[b.object.type](b.object), c = this[b.property.type](b.property), e = b.computed;
    console.log("object", a);
    console.log("property", c);
    return {type:b.type, object:a, property:c, computed:e};
  };
  a.ConditionalExpression = function(b) {
    console.log("ConditionalExpression", b);
    var a = this[b.callee.type](b.callee), c;
    for (c in b.arguments) {
      var e = b.arguments[c], e = this[e.type](e);
      (void 0).push(e);
    }
    return {type:b.type, callee:a, arguments:void 0};
  };
  a.CallExpression = function(b) {
    console.log("CallExpression", b);
    var a = this[b.callee.type](b.callee), c = [], e;
    for (e in b.arguments) {
      var f = b.arguments[e], f = this[f.type](f);
      c.push(f);
    }
    console.log("callee", a);
    console.log("arguments", c);
    return {type:b.type, callee:a, arguments:c};
  };
  a.NewExpression = function(b) {
    console.log("NewExpression", b);
    return {type:b.type};
  };
  a.SequenceExpression = function(b) {
    console.log("SequenceExpression", b);
    for (var a in b.expressions) {
      var c = b.expressions[a], c = this[c.type](c);
      (void 0).push(c);
    }
    return {type:b.type, expressions:void 0};
  };
})(Entry.PyToBlockParserTemp.prototype);
Entry.Toast = function() {
  this.toasts_ = [];
  var a = document.getElementById("entryToastContainer");
  a && document.body.removeChild(a);
  this.body_ = Entry.createElement("div", "entryToastContainer");
  this.body_.addClass("entryToastContainer");
  document.body.appendChild(this.body_);
};
Entry.Toast.prototype.warning = function(a, b, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastWarning");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = a;
  c.appendChild(e);
  a = Entry.createElement("p", "entryToast");
  a.addClass("entryToastMessage");
  a.innerHTML = b;
  c.appendChild(a);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var b = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(b), c.style.display = "none", Entry.removeElement(c));
      c.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.success = function(a, b, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastSuccess");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = a;
  c.appendChild(e);
  a = Entry.createElement("p", "entryToast");
  a.addClass("entryToastMessage");
  a.innerHTML = b;
  c.appendChild(a);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var b = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(b), c.style.display = "none", Entry.removeElement(c));
      c.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.alert = function(a, b, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastAlert");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = a;
  c.appendChild(e);
  a = Entry.createElement("p", "entryToast");
  a.addClass("entryToastMessage");
  a.innerHTML = b;
  c.appendChild(a);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var b = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(b), c.style.display = "none", Entry.toast.body_.removeChild(c));
      c.style.opacity *= .9;
    }, 20);
  }, 5E3);
};
Entry.TvCast = function(a) {
  this.generateView(a);
};
p = Entry.TvCast.prototype;
p.init = function(a) {
  this.tvCastHash = a;
};
p.generateView = function(a) {
  var b = Entry.createElement("div");
  b.addClass("entryContainerMovieWorkspace");
  b.addClass("entryRemove");
  this.movieContainer = b;
  b = Entry.createElement("iframe");
  b.setAttribute("id", "tvCastIframe");
  b.setAttribute("allowfullscreen", "");
  b.setAttribute("frameborder", 0);
  b.setAttribute("src", a);
  this.movieFrame = b;
  this.movieContainer.appendChild(this.movieFrame);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var a = document.getElementById("tvCastIframe");
  w = this.movieContainer.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};
Entry.ContextMenu = {};
(function(a) {
  a.createDom = function() {
    this.dom = Entry.Dom("ul", {id:"entry-contextmenu", parent:$("body")});
    Entry.Utils.disableContextmenu(this.dom);
    Entry.documentMousedown.attach(this, function() {
      this.hide();
    });
  };
  a.show = function(b, a) {
    this.dom || this.createDom();
    if (0 !== b.length) {
      var c = this;
      void 0 !== a && (this._className = a, this.dom.addClass(a));
      a = this.dom;
      a.empty();
      for (var e = 0, f = b.length;e < f;e++) {
        var g = b[e], h = g.text, k = !1 !== g.enable, l = Entry.Dom("li", {class:k ? "menuAble" : "menuDisable", parent:a});
        l.text(h);
        k && g.callback && function(b, a) {
          b.mousedown(function(b) {
            b.preventDefault();
            c.hide();
            a(b);
          });
        }(l, g.callback);
      }
      a.removeClass("entryRemove");
      this.position(Entry.mouseCoordinate);
    }
  };
  a.position = function(b) {
    var a = this.dom;
    a.css({left:0, top:0});
    var c = a.width(), e = a.height(), f = $(window), g = f.width(), f = f.height();
    b.x + c > g && (b.x -= c + 3);
    b.y + e > f && (b.y -= e);
    a.css({left:b.x, top:b.y});
  };
  a.hide = function() {
    this.dom.empty();
    this.dom.addClass("entryRemove");
    this._className && (this.dom.removeClass(this._className), delete this._className);
  };
})(Entry.ContextMenu);
Entry.Variable = function(a) {
  Entry.assert("string" == typeof a.name, "Variable name must be given");
  this.name_ = a.name;
  this.id_ = a.id ? a.id : Entry.generateHash();
  this.type = a.variableType ? a.variableType : "variable";
  this.object_ = a.object || null;
  this.isCloud_ = a.isCloud || !1;
  var b = Entry.parseNumber(a.value);
  this.value_ = "number" == typeof b ? b : a.value ? a.value : 0;
  "slide" == this.type && (this.minValue_ = Number(a.minValue ? a.minValue : 0), this.maxValue_ = Number(a.maxValue ? a.maxValue : 100));
  a.isClone || (this.visible_ = a.visible || "boolean" == typeof a.visible ? a.visible : !0, this.x_ = a.x ? a.x : null, this.y_ = a.y ? a.y : null, "list" == this.type && (this.width_ = a.width ? a.width : 100, this.height_ = a.height ? a.height : 120, this.array_ = a.array ? a.array : [], this.scrollPosition = 0), this.BORDER = 6, this.FONT = "10pt NanumGothic");
};
Entry.Variable.prototype.generateView = function(a) {
  var b = this.type;
  if ("variable" == b || "timer" == b || "answer" == b) {
    this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.wrapper_ = new createjs.Shape, this.view_.addChild(this.wrapper_), this.textView_ = new createjs.Text("asdf", this.FONT, "#000000"), this.textView_.textBaseline = "alphabetic", this.textView_.x = 4, this.textView_.y = 1, this.view_.addChild(this.textView_), this.valueView_ = new createjs.Text("asdf", "10pt NanumGothic", "#ffffff"), this.valueView_.textBaseline = 
    "alphabetic", b = Entry.variableContainer.variables_.length, this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(b / 11)), this.setY(24 * a + 20 - 135 - 264 * Math.floor(b / 11))), this.view_.visible = this.visible_, this.view_.addChild(this.valueView_), this.view_.on("mousedown", function(b) {
      "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * b.stageX - 240), y:this.y - (.75 * b.stageY - 135)}, this.cursor = "move");
    }), this.view_.on("pressmove", function(b) {
      "workspace" == Entry.type && (this.variable.setX(.75 * b.stageX - 240 + this.offset.x), this.variable.setY(.75 * b.stageY - 135 + this.offset.y), this.variable.updateView());
    });
  } else {
    if ("slide" == b) {
      var d = this;
      this.view_ = new createjs.Container;
      this.rect_ = new createjs.Shape;
      this.view_.addChild(this.rect_);
      this.view_.variable = this;
      this.wrapper_ = new createjs.Shape;
      this.view_.addChild(this.wrapper_);
      this.textView_ = new createjs.Text("name", this.FONT, "#000000");
      this.textView_.textBaseline = "alphabetic";
      this.textView_.x = 4;
      this.textView_.y = 1;
      this.view_.addChild(this.textView_);
      this.valueView_ = new createjs.Text("value", "10pt NanumGothic", "#ffffff");
      this.valueView_.textBaseline = "alphabetic";
      this.view_.on("mousedown", function(b) {
        "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * b.stageX - 240), y:this.y - (.75 * b.stageY - 135)});
      });
      this.view_.on("pressmove", function(b) {
        "workspace" != Entry.type || d.isAdjusting || (this.variable.setX(.75 * b.stageX - 240 + this.offset.x), this.variable.setY(.75 * b.stageY - 135 + this.offset.y), this.variable.updateView());
      });
      this.view_.visible = this.visible_;
      this.view_.addChild(this.valueView_);
      b = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26;
      b = Math.max(b, 90);
      this.maxWidth = b - 20;
      this.slideBar_ = new createjs.Shape;
      this.slideBar_.graphics.beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5);
      this.view_.addChild(this.slideBar_);
      b = this.getSlidePosition(this.maxWidth);
      this.valueSetter_ = new createjs.Shape;
      this.valueSetter_.graphics.beginFill("#1bafea").s("#A0A1A1").ss(1).dc(b, 10.5, 3);
      this.valueSetter_.cursor = "pointer";
      this.valueSetter_.on("mousedown", function(b) {
        Entry.engine.isState("run") && (d.isAdjusting = !0, this.offsetX = -(this.x - .75 * b.stageX + 240));
      });
      this.valueSetter_.on("pressmove", function(b) {
        if (Entry.engine.isState("run")) {
          var a = this.offsetX;
          this.offsetX = -(this.x - .75 * b.stageX + 240);
          a !== this.offsetX && (b = d.getX(), d.setSlideCommandX(b + 10 > this.offsetX ? 0 : b + d.maxWidth + 10 > this.offsetX ? this.offsetX - b : d.maxWidth + 10));
        }
      });
      this.valueSetter_.on("pressup", function(b) {
        d.isAdjusting = !1;
      });
      this.view_.addChild(this.valueSetter_);
      b = Entry.variableContainer.variables_.length;
      this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(b / 11)), this.setY(24 * a + 20 - 135 - 264 * Math.floor(b / 11)));
    } else {
      this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.titleView_ = new createjs.Text("asdf", this.FONT, "#000"), this.titleView_.textBaseline = "alphabetic", this.titleView_.textAlign = "center", this.titleView_.width = this.width_ - 2 * this.BORDER, this.titleView_.y = this.BORDER + 10, this.titleView_.x = this.width_ / 2, this.view_.addChild(this.titleView_), this.resizeHandle_ = new createjs.Shape, this.resizeHandle_.graphics.f("#1bafea").ss(1, 
      0, 0).s("#1bafea").lt(0, -9).lt(-9, 0).lt(0, 0), this.view_.addChild(this.resizeHandle_), this.resizeHandle_.list = this, this.resizeHandle_.on("mouseover", function(b) {
        this.cursor = "nwse-resize";
      }), this.resizeHandle_.on("mousedown", function(b) {
        this.list.isResizing = !0;
        this.offset = {x:.75 * b.stageX - this.list.getWidth(), y:.75 * b.stageY - this.list.getHeight()};
        this.parent.cursor = "nwse-resize";
      }), this.resizeHandle_.on("pressmove", function(b) {
        this.list.setWidth(.75 * b.stageX - this.offset.x);
        this.list.setHeight(.75 * b.stageY - this.offset.y);
        this.list.updateView();
      }), this.view_.on("mouseover", function(b) {
        this.cursor = "move";
      }), this.view_.on("mousedown", function(b) {
        "workspace" != Entry.type || this.variable.isResizing || (this.offset = {x:this.x - (.75 * b.stageX - 240), y:this.y - (.75 * b.stageY - 135)}, this.cursor = "move");
      }), this.view_.on("pressup", function(b) {
        this.cursor = "initial";
        this.variable.isResizing = !1;
      }), this.view_.on("pressmove", function(b) {
        "workspace" != Entry.type || this.variable.isResizing || (this.variable.setX(.75 * b.stageX - 240 + this.offset.x), this.variable.setY(.75 * b.stageY - 135 + this.offset.y), this.variable.updateView());
      }), this.elementView = new createjs.Container, b = new createjs.Text("asdf", this.FONT, "#000"), b.textBaseline = "middle", b.y = 5, this.elementView.addChild(b), this.elementView.indexView = b, b = new createjs.Shape, this.elementView.addChild(b), this.elementView.valueWrapper = b, b = new createjs.Text("fdsa", this.FONT, "#eee"), b.x = 24, b.y = 6, b.textBaseline = "middle", this.elementView.addChild(b), this.elementView.valueView = b, this.elementView.x = this.BORDER, this.scrollButton_ = 
      new createjs.Shape, this.scrollButton_.graphics.f("#aaa").rr(0, 0, 7, 30, 3.5), this.view_.addChild(this.scrollButton_), this.scrollButton_.y = 23, this.scrollButton_.list = this, this.scrollButton_.on("mousedown", function(b) {
        this.list.isResizing = !0;
        this.cursor = "pointer";
        this.offsetY = isNaN(this.offsetY) || 0 > this.offsetY ? b.rawY / 2 : this.offsetY;
      }), this.scrollButton_.on("pressmove", function(b) {
        void 0 === this.moveAmount ? (this.y = b.target.y, this.moveAmount = !0) : this.y = b.rawY / 2 - this.offsetY + this.list.height_ / 100 * 23;
        23 > this.y && (this.y = 23);
        this.y > this.list.getHeight() - 40 && (this.y = this.list.getHeight() - 40);
        this.list.updateView();
      }), this.scrollButton_.on("pressup", function(b) {
        this.moveAmount = void 0;
      }), this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (b = Entry.variableContainer.lists_.length, this.setX(110 * -Math.floor(b / 6) + 120), this.setY(24 * a + 20 - 135 - 145 * Math.floor(b / 6)));
    }
  }
  this.setVisible(this.isVisible());
  this.updateView();
  Entry.stage.loadVariable(this);
};
Entry.Variable.prototype.updateView = function() {
  if (this.view_ && this.isVisible()) {
    if ("variable" == this.type) {
      this.view_.x = this.getX();
      this.view_.y = this.getY();
      if (this.object_) {
        var a = Entry.container.getObject(this.object_);
        this.textView_.text = a ? a.name + ":" + this.getName() : this.getName();
      } else {
        this.textView_.text = this.getName();
      }
      this.valueView_.x = this.textView_.getMeasuredWidth() + 14;
      this.valueView_.y = 1;
      this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue();
      this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4);
      this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7);
    } else {
      if ("slide" == this.type) {
        this.view_.x = this.getX(), this.view_.y = this.getY(), this.object_ ? (a = Entry.container.getObject(this.object_), this.textView_.text = a ? a.name + ":" + this.getName() : this.getName()) : this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue(), a = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 
        26, a = Math.max(a, 90), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, a, 33, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7), a = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, a = Math.max(a, 90), this.maxWidth = a - 20, this.slideBar_.graphics.clear().beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 
        10, this.maxWidth, 1.5), a = this.getSlidePosition(this.maxWidth), this.valueSetter_.graphics.clear().beginFill("#1bafea").s("#A0A1A1").ss(1).dc(a, 10.5, 3);
      } else {
        if ("list" == this.type) {
          this.view_.x = this.getX();
          this.view_.y = this.getY();
          this.resizeHandle_.x = this.width_ - 2;
          this.resizeHandle_.y = this.height_ - 2;
          var b = this.getName();
          this.object_ && (a = Entry.container.getObject(this.object_)) && (b = a.name + ":" + b);
          b = 7 < b.length ? b.substr(0, 6) + ".." : b;
          this.titleView_.text = b;
          this.titleView_.x = this.width_ / 2;
          for (this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rect(0, 0, this.width_, this.height_);this.view_.children[4];) {
            this.view_.removeChild(this.view_.children[4]);
          }
          a = Math.floor((this.getHeight() - 20) / 20);
          a < this.array_.length ? (this.scrollButton_.y > this.getHeight() - 40 && (this.scrollButton_.y = this.getHeight() - 40), this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, -2, this.getWidth() - 20 - 10 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !0, this.scrollButton_.x = this.getWidth() - 12, this.scrollPosition = Math.floor((this.scrollButton_.y - 23) / (this.getHeight() - 23 - 40) * (this.array_.length - a))) : (this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, 
          -2, this.getWidth() - 20 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !1, this.scrollPosition = 0);
          for (b = this.scrollPosition;b < this.scrollPosition + a && b < this.array_.length;b++) {
            this.elementView.indexView.text = b + 1;
            var d = String(this.array_[b].data), c = Math.floor((this.getWidth() - 50) / 7), d = Entry.cutStringByLength(d, c), d = String(this.array_[b].data).length > d.length ? d + ".." : d;
            this.elementView.valueView.text = d;
            d = this.elementView.clone(!0);
            d.y = 20 * (b - this.scrollPosition) + 23;
            this.view_.addChild(d);
          }
        } else {
          "answer" == this.type ? (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? parseInt(this.getValue(), 10) == this.getValue() ? this.valueView_.text = this.getValue() : this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, 
          -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#E457DC").ss(1, 2, 0).s("#E457DC").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7)) : (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = 
          this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#ffbb14").ss(1, 2, 0).s("orange").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7));
        }
      }
    }
  }
};
Entry.Variable.prototype.getName = function() {
  return this.name_;
};
Entry.Variable.prototype.setName = function(a) {
  Entry.assert("string" == typeof a, "Variable name must be string");
  this.name_ = a;
  this.updateView();
};
Entry.Variable.prototype.getId = function() {
  return this.id_;
};
Entry.Variable.prototype.getValue = function() {
  return this.isNumber() ? Number(this.value_) : this.value_;
};
Entry.Variable.prototype.isNumber = function() {
  return isNaN(this.value_) ? !1 : !0;
};
Entry.Variable.prototype.setValue = function(a) {
  "slide" != this.type ? this.value_ = a : (a = Number(a), this.value_ = a < this.minValue_ ? this.minValue_ : a > this.maxValue_ ? this.maxValue_ : a);
  this.isCloud_ && Entry.variableContainer.updateCloudVariables();
  this.updateView();
};
Entry.Variable.prototype.isVisible = function() {
  return this.visible_;
};
Entry.Variable.prototype.setVisible = function(a) {
  Entry.assert("boolean" == typeof a, "Variable visible state must be boolean");
  (this.visible_ = this.view_.visible = a) && this.updateView();
};
Entry.Variable.prototype.setX = function(a) {
  this.x_ = a;
  this.updateView();
};
Entry.Variable.prototype.getX = function() {
  return this.x_;
};
Entry.Variable.prototype.setY = function(a) {
  this.y_ = a;
  this.updateView();
};
Entry.Variable.prototype.getY = function() {
  return this.y_;
};
Entry.Variable.prototype.setWidth = function(a) {
  this.width_ = 100 > a ? 100 : a;
  this.updateView();
};
Entry.Variable.prototype.getWidth = function() {
  return this.width_;
};
Entry.Variable.prototype.isInList = function(a, b) {
  this.getX();
  this.getY();
};
Entry.Variable.prototype.setHeight = function(a) {
  this.height_ = 100 > a ? 100 : a;
  this.updateView();
};
Entry.Variable.prototype.getHeight = function() {
  return this.height_;
};
Entry.Variable.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
};
Entry.Variable.prototype.loadSnapshot = function() {
  this.snapshot_ && !this.isCloud_ && this.syncModel_(this.snapshot_);
};
Entry.Variable.prototype.syncModel_ = function(a) {
  this.setX(a.x);
  this.setY(a.y);
  this.id_ = a.id;
  this.setVisible(a.visible);
  this.setValue(a.value);
  this.setName(a.name);
  this.isCloud_ = a.isCloud;
  "list" == this.type && (this.setWidth(a.width), this.setHeight(a.height), this.array_ = a.array);
};
Entry.Variable.prototype.toJSON = function() {
  var a = {};
  a.name = this.name_;
  a.id = this.id_;
  a.visible = this.visible_;
  a.value = this.value_;
  a.variableType = this.type;
  "list" == this.type ? (a.width = this.getWidth(), a.height = this.getHeight(), a.array = JSON.parse(JSON.stringify(this.array_))) : "slide" == this.type && (a.minValue = this.minValue_, a.maxValue = this.maxValue_);
  a.isCloud = this.isCloud_;
  a.object = this.object_;
  a.x = this.x_;
  a.y = this.y_;
  return a;
};
Entry.Variable.prototype.remove = function() {
  Entry.stage.removeVariable(this);
};
Entry.Variable.prototype.clone = function() {
  var a = this.toJSON();
  a.isClone = !0;
  return a = new Entry.Variable(a);
};
Entry.Variable.prototype.getType = function() {
  return this.type;
};
Entry.Variable.prototype.setType = function(a) {
  this.type = a;
};
Entry.Variable.prototype.getSlidePosition = function(a) {
  var b = this.minValue_;
  return Math.abs(this.value_ - b) / Math.abs(this.maxValue_ - b) * a + 10;
};
Entry.Variable.prototype.setSlideCommandX = function(a) {
  var b = this.valueSetter_.graphics.command;
  a = Math.max("undefined" == typeof a ? 10 : a, 10);
  a = Math.min(this.maxWidth + 10, a);
  b.x = a;
  this.updateSlideValueByView();
};
Entry.Variable.prototype.updateSlideValueByView = function() {
  var a = Math.max(this.valueSetter_.graphics.command.x - 10, 0) / this.maxWidth;
  0 > a && (a = 0);
  1 < a && (a = 1);
  var b = parseFloat(this.minValue_), d = parseFloat(this.maxValue_), a = (b + Number(Math.abs(d - b) * a)).toFixed(2), a = parseFloat(a);
  a < b ? a = this.minValue_ : a > d && (a = this.maxValue_);
  this.isFloatPoint() || (a = Math.round(a));
  this.setValue(a);
};
Entry.Variable.prototype.getMinValue = function() {
  return this.minValue_;
};
Entry.Variable.prototype.setMinValue = function(a) {
  this.minValue_ = a;
  this.value_ < a && (this.value_ = a);
  this.updateView();
  this.isMinFloat = Entry.isFloat(this.minValue_);
};
Entry.Variable.prototype.getMaxValue = function() {
  return this.maxValue_;
};
Entry.Variable.prototype.setMaxValue = function(a) {
  this.maxValue_ = a;
  this.value_ > a && (this.value_ = a);
  this.updateView();
  this.isMaxFloat = Entry.isFloat(this.maxValue_);
};
Entry.Variable.prototype.isFloatPoint = function() {
  return this.isMaxFloat || this.isMinFloat;
};
Entry.VariableContainer = function() {
  this.variables_ = [];
  this.messages_ = [];
  this.lists_ = [];
  this.functions_ = {};
  this.viewMode_ = "all";
  this.selected = null;
  this.variableAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.listAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.selectedVariable = null;
  this._variableRefs = [];
  this._messageRefs = [];
  this._functionRefs = [];
};
Entry.VariableContainer.prototype.createDom = function(a) {
  var b = this;
  this.view_ = a;
  var d = Entry.createElement("table");
  d.addClass("entryVariableSelectorWorkspace");
  this.view_.appendChild(d);
  var c = Entry.createElement("tr");
  d.appendChild(c);
  var e = this.createSelectButton("all");
  e.setAttribute("rowspan", "2");
  e.addClass("selected", "allButton");
  c.appendChild(e);
  c.appendChild(this.createSelectButton("variable", Entry.variableEnable));
  c.appendChild(this.createSelectButton("message", Entry.messageEnable));
  c = Entry.createElement("tr");
  c.appendChild(this.createSelectButton("list", Entry.listEnable));
  c.appendChild(this.createSelectButton("func", Entry.functionEnable));
  d.appendChild(c);
  d = Entry.createElement("ul");
  d.addClass("entryVariableListWorkspace");
  this.view_.appendChild(d);
  this.listView_ = d;
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.variable_create;
  var f = this;
  this.variableAddButton_ = d;
  d.bindOnClick(function(a) {
    a = f.variableAddPanel;
    var d = a.view.name.value.trim();
    a.isOpen ? d && 0 !== d.length ? b.addVariable() : (a.view.addClass("entryRemove"), a.isOpen = !1) : (a.view.removeClass("entryRemove"), a.view.name.focus(), a.isOpen = !0);
  });
  this.generateVariableAddView();
  this.generateListAddView();
  this.generateVariableSplitterView();
  this.generateVariableSettingView();
  this.generateListSettingView();
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.message_create;
  this.messageAddButton_ = d;
  d.bindOnClick(function(a) {
    b.addMessage({name:Lang.Workspace.message + " " + (b.messages_.length + 1)});
  });
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.list_create;
  this.listAddButton_ = d;
  d.bindOnClick(function(a) {
    a = f.listAddPanel;
    var d = a.view.name.value.trim();
    a.isOpen ? d && 0 !== d.length ? b.addList() : (a.view.addClass("entryRemove"), a.isOpen = !1) : (a.view.removeClass("entryRemove"), a.view.name.focus(), a.isOpen = !0);
  });
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.function_create;
  this.functionAddButton_ = d;
  d.bindOnClick(function(a) {
    a = b._getBlockMenu();
    Entry.playground.changeViewMode("code");
    "func" != a.lastSelector && a.selectMenu("func");
    b.createFunction();
  });
  return a;
};
Entry.VariableContainer.prototype.createSelectButton = function(a, b) {
  var d = this;
  void 0 === b && (b = !0);
  var c = Entry.createElement("td");
  c.addClass("entryVariableSelectButtonWorkspace", a);
  c.innerHTML = Lang.Workspace[a];
  b ? c.bindOnClick(function(b) {
    d.selectFilter(a);
    this.addClass("selected");
  }) : c.addClass("disable");
  return c;
};
Entry.VariableContainer.prototype.selectFilter = function(a) {
  for (var b = this.view_.getElementsByTagName("td"), d = 0;d < b.length;d++) {
    b[d].removeClass("selected"), b[d].hasClass(a) && b[d].addClass("selected");
  }
  this.viewMode_ = a;
  this.select();
  this.updateList();
};
Entry.VariableContainer.prototype.updateVariableAddView = function(a) {
  a = "variable" == (a ? a : "variable") ? this.variableAddPanel : this.listAddPanel;
  var b = a.info, d = a.view;
  a.view.addClass("entryRemove");
  d.cloudCheck.removeClass("entryVariableAddChecked");
  d.localCheck.removeClass("entryVariableAddChecked");
  d.globalCheck.removeClass("entryVariableAddChecked");
  d.cloudWrapper.removeClass("entryVariableAddSpaceUnCheckedWorkspace");
  b.isCloud && d.cloudCheck.addClass("entryVariableAddChecked");
  a.isOpen && (d.removeClass("entryRemove"), d.name.focus());
  b.object ? (d.localCheck.addClass("entryVariableAddChecked"), d.cloudWrapper.addClass("entryVariableAddSpaceUnCheckedWorkspace")) : d.globalCheck.addClass("entryVariableAddChecked");
};
Entry.VariableContainer.prototype.select = function(a) {
  a = this.selected == a ? null : a;
  this.selected && (this.selected.listElement.removeClass("selected"), this.selected.callerListElement && (this.listView_.removeChild(this.selected.callerListElement), delete this.selected.callerListElement), this.selected = null);
  a && (a.listElement.addClass("selected"), this.selected = a, a instanceof Entry.Variable ? (this.renderVariableReference(a), a.object_ && Entry.container.selectObject(a.object_, !0)) : a instanceof Entry.Func ? this.renderFunctionReference(a) : this.renderMessageReference(a));
};
Entry.VariableContainer.prototype.renderMessageReference = function(a) {
  for (var b = this, d = this._messageRefs, c = a.id, e = [], f = 0;f < d.length;f++) {
    -1 < d[f].block.params.indexOf(c) && e.push(d[f]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var c = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(c.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = c.object.name + " : " + Lang.Blocks["START_" + c.block.type];
    g.appendChild(h);
    g.caller = c;
    g.message = a;
    g.bindOnClick(function(a) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), b.select(null), b.select(this.message));
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  a.callerListElement = d;
  this.listView_.insertBefore(d, a.listElement);
  this.listView_.insertBefore(a.listElement, d);
};
Entry.VariableContainer.prototype.renderVariableReference = function(a) {
  for (var b = this, d = this._variableRefs, c = a.id_, e = [], f = 0;f < d.length;f++) {
    -1 < d[f].block.params.indexOf(c) && e.push(d[f]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var c = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(c.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = c.object.name + " : " + Lang.Blocks["VARIABLE_" + c.block.type];
    g.appendChild(h);
    g.caller = c;
    g.variable = a;
    g.bindOnClick(function(a) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), b.select(null));
      a = this.caller;
      a = a.funcBlock || a.block;
      a.view.getBoard().activateBlock(a);
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  a.callerListElement = d;
  this.listView_.insertBefore(d, a.listElement);
  this.listView_.insertBefore(a.listElement, d);
};
Entry.VariableContainer.prototype.renderFunctionReference = function(a) {
  for (var b = this, d = this._functionRefs, c = [], e = 0;e < d.length;e++) {
    c.push(d[e]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (e in c) {
    var f = c[e], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(f.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = f.object.name;
    g.appendChild(h);
    g.caller = f;
    g.bindOnClick(function(d) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), b.select(null), b.select(a));
      d = this.caller.block;
      Entry.playground.toggleOnVariableView();
      d.view.getBoard().activateBlock(d);
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === c.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  a.callerListElement = d;
  this.listView_.insertBefore(d, a.listElement);
  this.listView_.insertBefore(a.listElement, d);
};
Entry.VariableContainer.prototype.updateList = function() {
  if (this.listView_) {
    this.variableSettingView.addClass("entryRemove");
    for (this.listSettingView.addClass("entryRemove");this.listView_.firstChild;) {
      this.listView_.removeChild(this.listView_.firstChild);
    }
    var a = this.viewMode_, b = [];
    if ("all" == a || "message" == a) {
      "message" == a && this.listView_.appendChild(this.messageAddButton_);
      for (var d in this.messages_) {
        var c = this.messages_[d];
        b.push(c);
        var e = c.listElement;
        this.listView_.appendChild(e);
        c.callerListElement && this.listView_.appendChild(c.callerListElement);
      }
    }
    if ("all" == a || "variable" == a) {
      if ("variable" == a) {
        e = this.variableAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.variableAddButton_);
        this.listView_.appendChild(this.variableAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.Variable_used_at_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        for (d in this.variables_) {
          c = this.variables_[d], c.object_ || (b.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.Variable_used_at_special_object;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (d in this.variables_) {
          c = this.variables_[d], c.object_ && (b.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (d in this.variables_) {
          c = this.variables_[d], b.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement);
        }
      }
    }
    if ("all" == a || "list" == a) {
      if ("list" == a) {
        e = this.listAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.listAddButton_);
        this.listView_.appendChild(this.listAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.List_used_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        this.updateVariableAddView("list");
        for (d in this.lists_) {
          c = this.lists_[d], c.object_ || (b.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.list_used_specific_objects;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (d in this.lists_) {
          c = this.lists_[d], c.object_ && (b.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (d in this.lists_) {
          c = this.lists_[d], b.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement);
        }
      }
    }
    if ("all" == a || "func" == a) {
      for (d in "func" == a && this.listView_.appendChild(this.functionAddButton_), this.functions_) {
        a = this.functions_[d], b.push(a), e = a.listElement, this.listView_.appendChild(e), a.callerListElement && this.listView_.appendChild(a.callerListElement);
      }
    }
    this.listView_.appendChild(this.variableSettingView);
    this.listView_.appendChild(this.listSettingView);
  }
};
Entry.VariableContainer.prototype.setMessages = function(a) {
  for (var b in a) {
    var d = a[b];
    d.id || (d.id = Entry.generateHash());
    this.createMessageView(d);
    this.messages_.push(d);
  }
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setVariables = function(a) {
  for (var b in a) {
    var d = new Entry.Variable(a[b]), c = d.getType();
    "variable" == c || "slide" == c ? (d.generateView(this.variables_.length), this.createVariableView(d), this.variables_.push(d)) : "list" == c ? (d.generateView(this.lists_.length), this.createListView(d), this.lists_.push(d)) : "timer" == c ? this.generateTimer(d) : "answer" == c && this.generateAnswer(d);
  }
  Entry.isEmpty(Entry.engine.projectTimer) && Entry.variableContainer.generateTimer();
  Entry.isEmpty(Entry.container.inputValue) && Entry.variableContainer.generateAnswer();
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setFunctions = function(a) {
  for (var b in a) {
    var d = new Entry.Func(a[b]);
    d.generateBlock();
    this.createFunctionView(d);
    this.functions_[d.id] = d;
  }
  this.updateList();
};
Entry.VariableContainer.prototype.getFunction = function(a) {
  return this.functions_[a];
};
Entry.VariableContainer.prototype.getVariable = function(a, b) {
  var d = Entry.findObjsByKey(this.variables_, "id_", a)[0];
  b && b.isClone && d.object_ && (d = Entry.findObjsByKey(b.variables, "id_", a)[0]);
  return d;
};
Entry.VariableContainer.prototype.getList = function(a, b) {
  var d = Entry.findObjsByKey(this.lists_, "id_", a)[0];
  b && b.isClone && d.object_ && (d = Entry.findObjsByKey(b.lists, "id_", a)[0]);
  return d;
};
Entry.VariableContainer.prototype.createFunction = function() {
  if (!Entry.Func.isEdit) {
    var a = new Entry.Func;
    Entry.Func.edit(a);
  }
};
Entry.VariableContainer.prototype.addFunction = function(a) {
};
Entry.VariableContainer.prototype.removeFunction = function(a) {
  this.functions_[a.id].destroy();
  delete this.functions_[a.id];
  this.updateList();
};
Entry.VariableContainer.prototype.checkListPosition = function(a, b) {
  var d = a.x_ + a.width_, c = -a.y_, e = -a.y_ + -a.height_;
  return b.x > a.x_ && b.x < d && b.y < c && b.y > e ? !0 : !1;
};
Entry.VariableContainer.prototype.getListById = function(a) {
  var b = this.lists_, d = [];
  if (0 < b.length) {
    for (var c = 0;c < b.length;c++) {
      this.checkListPosition(b[c], a) && d.push(b[c]);
    }
    return d;
  }
  return !1;
};
Entry.VariableContainer.prototype.editFunction = function(a, b) {
};
Entry.VariableContainer.prototype.saveFunction = function(a) {
  this.functions_[a.id] || (this.functions_[a.id] = a, this.createFunctionView(a));
  a.listElement.nameField.innerHTML = a.description;
  this.updateList();
};
Entry.VariableContainer.prototype.createFunctionView = function(a) {
  var b = this;
  if (this.view_) {
    var d = Entry.createElement("li");
    d.addClass("entryVariableListElementWorkspace");
    d.addClass("entryFunctionElementWorkspace");
    d.bindOnClick(function(d) {
      d.stopPropagation();
      b.select(a);
    });
    var c = Entry.createElement("button");
    c.addClass("entryVariableListElementDeleteWorkspace");
    c.bindOnClick(function(d) {
      d.stopPropagation();
      b.removeFunction(a);
      b.selected = null;
    });
    var e = Entry.createElement("button");
    e.addClass("entryVariableListElementEditWorkspace");
    var f = this._getBlockMenu();
    e.bindOnClick(function(b) {
      b.stopPropagation();
      Entry.Func.edit(a);
      Entry.playground && (Entry.playground.changeViewMode("code"), "func" != f.lastSelector && f.selectMenu("func"));
    });
    var g = Entry.createElement("div");
    g.addClass("entryVariableFunctionElementNameWorkspace");
    g.innerHTML = a.description;
    d.nameField = g;
    d.appendChild(g);
    d.appendChild(e);
    d.appendChild(c);
    a.listElement = d;
  }
};
Entry.VariableContainer.prototype.checkAllVariableName = function(a, b) {
  b = this[b];
  for (var d = 0;d < b.length;d++) {
    if (b[d].name_ == a) {
      return !0;
    }
  }
  return !1;
};
Entry.VariableContainer.prototype.addVariable = function(a) {
  if (!a) {
    var b = this.variableAddPanel;
    a = b.view.name.value.trim();
    a && 0 !== a.length || (a = Lang.Workspace.variable);
    a = this.checkAllVariableName(a, "variables_") ? Entry.getOrderedName(a, this.variables_, "name_") : a;
    var d = b.info;
    a = {name:a, isCloud:d.isCloud, object:d.object, variableType:"variable"};
    b.view.addClass("entryRemove");
    this.resetVariableAddPanel("variable");
  }
  a = new Entry.Variable(a);
  Entry.stateManager && Entry.stateManager.addCommand("add variable", this, this.removeVariable, a);
  a.generateView(this.variables_.length);
  this.createVariableView(a);
  this.variables_.unshift(a);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removeVariable, a);
};
Entry.VariableContainer.prototype.removeVariable = function(a) {
  var b = this.variables_.indexOf(a), d = a.toJSON();
  this.selected == a && this.select(null);
  a.remove();
  this.variables_.splice(b, 1);
  Entry.stateManager && Entry.stateManager.addCommand("remove variable", this, this.addVariable, d);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addVariable, d);
};
Entry.VariableContainer.prototype.changeVariableName = function(a, b) {
  a.name_ != b && (Entry.isExist(b, "name_", this.variables_) ? (a.listElement.nameField.value = a.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_dup)) : 10 < b.length ? (a.listElement.nameField.value = a.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_too_long)) : (a.name_ = b, a.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.variable_rename, Lang.Workspace.variable_rename_ok)));
};
Entry.VariableContainer.prototype.changeListName = function(a, b) {
  a.name_ != b && (Entry.isExist(b, "name_", this.lists_) ? (a.listElement.nameField.value = a.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_dup)) : 10 < b.length ? (a.listElement.nameField.value = a.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_too_long)) : (a.name_ = b, a.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.list_rename, Lang.Workspace.list_rename_ok)));
};
Entry.VariableContainer.prototype.removeList = function(a) {
  var b = this.lists_.indexOf(a), d = a.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove list", this, this.addList, d);
  this.selected == a && this.select(null);
  a.remove();
  this.lists_.splice(b, 1);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addList, d);
};
Entry.VariableContainer.prototype.createVariableView = function(a) {
  var b = this, d = Entry.createElement("li"), c = Entry.createElement("div");
  c.addClass("entryVariableListElementWrapperWorkspace");
  d.appendChild(c);
  d.addClass("entryVariableListElementWorkspace");
  a.object_ ? d.addClass("entryVariableLocalElementWorkspace") : a.isCloud_ ? d.addClass("entryVariableCloudElementWorkspace") : d.addClass("entryVariableGlobalElementWorkspace");
  d.bindOnClick(function(d) {
    b.select(a);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(d) {
    d.stopPropagation();
    b.removeVariable(a);
    b.selectedVariable = null;
    b.variableSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(d) {
    d.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    b.updateSelectedVariable(a);
    h.focus();
  });
  d.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(a) {
    a.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    b.updateSelectedVariable(null, "variable");
  });
  d.editSaveButton = g;
  var h = Entry.createElement("input");
  h.addClass("entryVariableListElementNameWorkspace");
  h.setAttribute("disabled", "disabled");
  h.value = a.name_;
  h.bindOnClick(function(b) {
    b.stopPropagation();
  });
  h.onblur = function(d) {
    (d = this.value.trim()) && 0 !== d.length ? b.changeVariableName(a, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.variable_can_not_space), this.value = a.getName());
  };
  h.onkeydown = function(b) {
    13 == b.keyCode && this.blur();
  };
  d.nameField = h;
  c.appendChild(h);
  c.appendChild(f);
  c.appendChild(g);
  c.appendChild(e);
  a.listElement = d;
};
Entry.VariableContainer.prototype.addMessage = function(a) {
  a.id || (a.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add message", this, this.removeMessage, a);
  this.createMessageView(a);
  this.messages_.unshift(a);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removeMessage, a);
};
Entry.VariableContainer.prototype.removeMessage = function(a) {
  this.selected == a && this.select(null);
  Entry.stateManager && Entry.stateManager.addCommand("remove message", this, this.addMessage, a);
  var b = this.messages_.indexOf(a);
  this.messages_.splice(b, 1);
  this.updateList();
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addMessage, a);
};
Entry.VariableContainer.prototype.changeMessageName = function(a, b) {
  a.name != b && (Entry.isExist(b, "name", this.messages_) ? (a.listElement.nameField.value = a.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_dup)) : 10 < b.length ? (a.listElement.nameField.value = a.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_too_long)) : (a.name = b, Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.message_rename, Lang.Workspace.message_rename_ok)));
};
Entry.VariableContainer.prototype.createMessageView = function(a) {
  var b = this, d = Entry.createElement("li");
  d.addClass("entryVariableListElementWorkspace");
  d.addClass("entryMessageElementWorkspace");
  d.bindOnClick(function(d) {
    b.select(a);
  });
  var c = Entry.createElement("button");
  c.addClass("entryVariableListElementDeleteWorkspace");
  c.bindOnClick(function(d) {
    d.stopPropagation();
    b.removeMessage(a);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementEditWorkspace");
  e.bindOnClick(function(b) {
    b.stopPropagation();
    g.removeAttribute("disabled");
    g.focus();
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.addClass("entryRemove");
  f.bindOnClick(function(b) {
    b.stopPropagation();
    g.blur();
    e.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var g = Entry.createElement("input");
  g.addClass("entryVariableListElementNameWorkspace");
  g.value = a.name;
  g.bindOnClick(function(b) {
    b.stopPropagation();
  });
  g.onblur = function(d) {
    (d = this.value.trim()) && 0 !== d.length ? (b.changeMessageName(a, this.value), e.removeClass("entryRemove"), f.addClass("entryRemove"), g.setAttribute("disabled", "disabled")) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.sign_can_not_space), this.value = a.name);
  };
  g.onkeydown = function(b) {
    13 == b.keyCode && this.blur();
  };
  d.nameField = g;
  d.appendChild(g);
  d.appendChild(e);
  d.appendChild(f);
  d.appendChild(c);
  a.listElement = d;
};
Entry.VariableContainer.prototype.addList = function(a) {
  if (!a) {
    var b = this.listAddPanel;
    a = b.view.name.value.trim();
    a && 0 !== a.length || (a = Lang.Workspace.list);
    var d = b.info;
    a = this.checkAllVariableName(a, "lists_") ? Entry.getOrderedName(a, this.lists_, "name_") : a;
    a = {name:a, isCloud:d.isCloud, object:d.object, variableType:"list"};
    b.view.addClass("entryRemove");
    this.resetVariableAddPanel("list");
  }
  a = new Entry.Variable(a);
  Entry.stateManager && Entry.stateManager.addCommand("add list", this, this.removeList, a);
  a.generateView(this.lists_.length);
  this.createListView(a);
  this.lists_.unshift(a);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removelist, a);
};
Entry.VariableContainer.prototype.createListView = function(a) {
  var b = this, d = Entry.createElement("li"), c = Entry.createElement("div");
  c.addClass("entryVariableListElementWrapperWorkspace");
  d.appendChild(c);
  d.addClass("entryVariableListElementWorkspace");
  a.object_ ? d.addClass("entryListLocalElementWorkspace") : a.isCloud_ ? d.addClass("entryListCloudElementWorkspace") : d.addClass("entryListGlobalElementWorkspace");
  d.bindOnClick(function(d) {
    b.select(a);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(d) {
    d.stopPropagation();
    b.removeList(a);
    b.selectedList = null;
    b.listSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(d) {
    d.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    b.updateSelectedVariable(a);
    h.focus();
  });
  d.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(d) {
    d.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    b.select(a);
    b.updateSelectedVariable(null, "list");
  });
  d.editSaveButton = g;
  var h = Entry.createElement("input");
  h.setAttribute("disabled", "disabled");
  h.addClass("entryVariableListElementNameWorkspace");
  h.value = a.name_;
  h.bindOnClick(function(b) {
    b.stopPropagation();
  });
  h.onblur = function(d) {
    (d = this.value.trim()) && 0 !== d.length ? b.changeListName(a, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.list_can_not_space), this.value = a.getName());
  };
  h.onkeydown = function(b) {
    13 == b.keyCode && this.blur();
  };
  d.nameField = h;
  c.appendChild(h);
  c.appendChild(f);
  c.appendChild(g);
  c.appendChild(e);
  a.listElement = d;
};
Entry.VariableContainer.prototype.mapVariable = function(a, b) {
  for (var d = this.variables_.length, c = 0;c < d;c++) {
    a(this.variables_[c], b);
  }
};
Entry.VariableContainer.prototype.mapList = function(a, b) {
  for (var d = this.lists_.length, c = 0;c < d;c++) {
    a(this.lists_[c], b);
  }
};
Entry.VariableContainer.prototype.getVariableJSON = function() {
  for (var a = [], b = 0;b < this.variables_.length;b++) {
    a.push(this.variables_[b].toJSON());
  }
  for (b = 0;b < this.lists_.length;b++) {
    a.push(this.lists_[b].toJSON());
  }
  Entry.engine.projectTimer && a.push(Entry.engine.projectTimer);
  b = Entry.container.inputValue;
  Entry.isEmpty(b) || a.push(b);
  return a;
};
Entry.VariableContainer.prototype.getMessageJSON = function() {
  for (var a = [], b = 0;b < this.messages_.length;b++) {
    a.push({id:this.messages_[b].id, name:this.messages_[b].name});
  }
  return a;
};
Entry.VariableContainer.prototype.getFunctionJSON = function() {
  var a = [], b;
  for (b in this.functions_) {
    var d = this.functions_[b], d = {id:d.id, content:JSON.stringify(d.content.toJSON())};
    a.push(d);
  }
  return a;
};
Entry.VariableContainer.prototype.resetVariableAddPanel = function(a) {
  a = a || "variable";
  var b = "variable" == a ? this.variableAddPanel : this.listAddPanel, d = b.info;
  d.isCloud = !1;
  d.object = null;
  b.view.name.value = "";
  b.isOpen = !1;
  this.updateVariableAddView(a);
};
Entry.VariableContainer.prototype.generateVariableAddView = function() {
  var a = this, b = Entry.createElement("li");
  this.variableAddPanel.view = b;
  this.variableAddPanel.isOpen = !1;
  b.addClass("entryVariableAddSpaceWorkspace");
  b.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  b.appendChild(d);
  var c = Entry.createElement("input");
  c.addClass("entryVariableAddSpaceInputWorkspace");
  c.setAttribute("placeholder", Lang.Workspace.Variable_placeholder_name);
  c.variableContainer = this;
  c.onkeypress = function(b) {
    13 == b.keyCode && (Entry.variableContainer.addVariable(), a.updateSelectedVariable(a.variables_[0]), b = a.variables_[0].listElement, b.editButton.addClass("entryRemove"), b.editSaveButton.removeClass("entryRemove"), b.nameField.removeAttribute("disabled"));
  };
  this.variableAddPanel.view.name = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  d.bindOnClick(function(b) {
    a.variableAddPanel.info.object = null;
    a.updateVariableAddView("variable");
  });
  b.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_all_objects;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.globalCheck = c;
  this.variableAddPanel.info.object || c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  d.bindOnClick(function(b) {
    Entry.playground.object && (b = a.variableAddPanel.info, b.object = Entry.playground.object.id, b.isCloud = !1, a.updateVariableAddView("variable"));
  });
  b.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_this_object;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.localCheck = c;
  this.variableAddPanel.info.object && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  b.cloudWrapper = d;
  d.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  d.bindOnClick(function(b) {
    b = a.variableAddPanel.info;
    b.object || (b.isCloud = !b.isCloud, a.updateVariableAddView("variable"));
  });
  b.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  c.innerHTML = Lang.Workspace.Variable_create_cloud;
  d.appendChild(c);
  c = Entry.createElement("span");
  this.variableAddPanel.view.cloudCheck = c;
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  c.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.variableAddPanel.info.isCloud && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  b.appendChild(d);
  b = Entry.createElement("span");
  b.addClass("entryVariableAddSpaceCancelWorkspace");
  b.addClass("entryVariableAddSpaceButtonWorkspace");
  b.innerHTML = Lang.Buttons.cancel;
  b.bindOnClick(function(b) {
    a.variableAddPanel.view.addClass("entryRemove");
    a.resetVariableAddPanel("variable");
  });
  d.appendChild(b);
  b = Entry.createElement("span");
  b.addClass("entryVariableAddSpaceConfirmWorkspace");
  b.addClass("entryVariableAddSpaceButtonWorkspace");
  b.innerHTML = Lang.Buttons.save;
  b.variableContainer = this;
  b.bindOnClick(function(b) {
    Entry.variableContainer.addVariable();
    a.updateSelectedVariable(a.variables_[0]);
    b = a.variables_[0].listElement;
    b.editButton.addClass("entryRemove");
    b.editSaveButton.removeClass("entryRemove");
    b.nameField.removeAttribute("disabled");
  });
  d.appendChild(b);
};
Entry.VariableContainer.prototype.generateListAddView = function() {
  var a = this, b = Entry.createElement("li");
  this.listAddPanel.view = b;
  this.listAddPanel.isOpen = !1;
  b.addClass("entryVariableAddSpaceWorkspace");
  b.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  d.addClass("entryListAddSpaceNameWrapperWorkspace");
  b.appendChild(d);
  var c = Entry.createElement("input");
  c.addClass("entryVariableAddSpaceInputWorkspace");
  c.setAttribute("placeholder", Lang.Workspace.list_name);
  this.listAddPanel.view.name = c;
  c.variableContainer = this;
  c.onkeypress = function(b) {
    13 == b.keyCode && (a.addList(), b = a.lists_[0], a.updateSelectedVariable(b), b = b.listElement, b.editButton.addClass("entryRemove"), b.editSaveButton.removeClass("entryRemove"), b.nameField.removeAttribute("disabled"));
  };
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  d.bindOnClick(function(b) {
    a.listAddPanel.info.object = null;
    a.updateVariableAddView("list");
  });
  b.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.use_all_objects;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.globalCheck = c;
  this.listAddPanel.info.object || c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  d.bindOnClick(function(b) {
    Entry.playground.object && (b = a.listAddPanel.info, b.object = Entry.playground.object.id, b.isCloud = !1, a.updateVariableAddView("list"));
  });
  b.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_this_object;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.localCheck = c;
  this.variableAddPanel.info.object && addVariableLocalCheck.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  b.cloudWrapper = d;
  d.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  d.bindOnClick(function(b) {
    b = a.listAddPanel.info;
    b.object || (b.isCloud = !b.isCloud, a.updateVariableAddView("list"));
  });
  b.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  c.innerHTML = Lang.Workspace.List_create_cloud;
  d.appendChild(c);
  c = Entry.createElement("span");
  this.listAddPanel.view.cloudCheck = c;
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  c.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.listAddPanel.info.isCloud && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  b.appendChild(d);
  b = Entry.createElement("span");
  b.addClass("entryVariableAddSpaceCancelWorkspace");
  b.addClass("entryVariableAddSpaceButtonWorkspace");
  b.innerHTML = Lang.Buttons.cancel;
  b.bindOnClick(function(b) {
    a.listAddPanel.view.addClass("entryRemove");
    a.resetVariableAddPanel("list");
  });
  d.appendChild(b);
  b = Entry.createElement("span");
  b.addClass("entryVariableAddSpaceConfirmWorkspace");
  b.addClass("entryVariableAddSpaceButtonWorkspace");
  b.innerHTML = Lang.Buttons.save;
  b.variableContainer = this;
  b.bindOnClick(function(b) {
    a.addList();
    b = a.lists_[0];
    a.updateSelectedVariable(b);
    b = b.listElement;
    b.editButton.addClass("entryRemove");
    b.editSaveButton.removeClass("entryRemove");
    b.nameField.removeAttribute("disabled");
  });
  d.appendChild(b);
};
Entry.VariableContainer.prototype.generateVariableSplitterView = function() {
  var a = Entry.createElement("li");
  a.addClass("entryVariableSplitterWorkspace");
  var b = Entry.createElement("li");
  b.addClass("entryVariableSplitterWorkspace");
  this.variableSplitters = {top:a, bottom:b};
};
Entry.VariableContainer.prototype.openVariableAddPanel = function(a) {
  a = a ? a : "variable";
  Entry.playground.toggleOnVariableView();
  Entry.playground.changeViewMode("variable");
  "variable" == a ? this.variableAddPanel.isOpen = !0 : this.listAddPanel.isOpen = !0;
  this.selectFilter(a);
  this.updateVariableAddView(a);
};
Entry.VariableContainer.prototype.getMenuXml = function(a) {
  for (var b = [], d = 0 !== this.variables_.length, c = 0 !== this.lists_.length, e, f = 0, g;g = a[f];f++) {
    var h = g.tagName;
    h && "BLOCK" == h.toUpperCase() ? (e = g.getAttribute("bCategory"), !d && "variable" == e || !c && "list" == e || b.push(g)) : !h || "SPLITTER" != h.toUpperCase() && "BTN" != h.toUpperCase() || !d && "variable" == e || (c || "list" != e) && b.push(g);
  }
  return b;
};
Entry.VariableContainer.prototype.addCloneLocalVariables = function(a) {
  var b = [], d = this;
  this.mapVariable(function(a, d) {
    a.object_ && a.object_ == d.objectId && (a = a.toJSON(), a.originId = a.id, a.id = Entry.generateHash(), a.object = d.newObjectId, delete a.x, delete a.y, b.push(a), d.json.script = d.json.script.replace(new RegExp(a.originId, "g"), a.id));
  }, a);
  b.map(function(b) {
    d.addVariable(b);
  });
};
Entry.VariableContainer.prototype.generateTimer = function(a) {
  a || (a = {}, a.id = Entry.generateHash(), a.name = Lang.Workspace.Variable_Timer, a.value = 0, a.variableType = "timer", a.visible = !1, a.x = 150, a.y = -70, a = new Entry.Variable(a));
  a.generateView();
  a.tick = null;
  Entry.engine.projectTimer = a;
  Entry.addEventListener("stop", function() {
    Entry.engine.stopProjectTimer();
  });
};
Entry.VariableContainer.prototype.generateAnswer = function(a) {
  a || (a = new Entry.Variable({id:Entry.generateHash(), name:Lang.Blocks.VARIABLE_get_canvas_input_value, value:0, variableType:"answer", visible:!1, x:150, y:-100}));
  a.generateView();
  Entry.container.inputValue = a;
};
Entry.VariableContainer.prototype.generateVariableSettingView = function() {
  var a = this, b = Entry.createElement("div");
  b.bindOnClick(function(b) {
    b.stopPropagation();
  });
  this.variableSettingView = b;
  b.addClass("entryVariableSettingWorkspace");
  this.listView_.appendChild(b);
  b.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableSettingVisibleWrapperWorkspace");
  d.bindOnClick(function(b) {
    b = a.selectedVariable;
    var d = a.variableSettingView.visibleCheck;
    b.setVisible(!b.isVisible());
    b.isVisible() ? d.addClass("entryVariableSettingChecked") : d.removeClass("entryVariableSettingChecked");
  });
  b.appendChild(d);
  var c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.show_variable;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableSettingCheckWorkspace");
  b.visibleCheck = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingInitValueWrapperWorkspace");
  b.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.default_value;
  d.appendChild(c);
  c = Entry.createElement("input");
  c.addClass("entryVariableSettingInitValueInputWorkspace");
  b.initValueInput = c;
  c.value = 0;
  c.onkeyup = function(b) {
    a.selectedVariable.setValue(this.value);
  };
  c.onblur = function(b) {
    a.selectedVariable.setValue(this.value);
  };
  b.initValueInput = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingSplitterWorkspace");
  b.appendChild(d);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingSlideWrapperWorkspace");
  b.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.slide;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableSettingCheckWorkspace");
  b.slideCheck = c;
  d.appendChild(c);
  d.bindOnClick(function(b) {
    var d;
    b = a.selectedVariable;
    var c = a.variables_, f = b.getType();
    "variable" == f ? (d = b.toJSON(), d.variableType = "slide", d = new Entry.Variable(d), c.splice(c.indexOf(b), 0, d), 0 > d.getValue() && d.setValue(0), 100 < d.getValue() && d.setValue(100), e.removeAttribute("disabled"), g.removeAttribute("disabled")) : "slide" == f && (d = b.toJSON(), d.variableType = "variable", d = new Entry.Variable(d), c.splice(c.indexOf(b), 0, d), e.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
    a.createVariableView(d);
    a.removeVariable(b);
    a.updateSelectedVariable(d);
    d.generateView();
  });
  d = Entry.createElement("div");
  b.minMaxWrapper = d;
  d.addClass("entryVariableSettingMinMaxWrapperWorkspace");
  b.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.min_value;
  d.appendChild(c);
  var e = Entry.createElement("input");
  e.addClass("entryVariableSettingMinValueInputWorkspace");
  c = a.selectedVariable;
  e.value = c && "slide" == c.type ? c.minValue_ : 0;
  e.onblur = function(b) {
    isNaN(this.value) || (b = a.selectedVariable, b.setMinValue(this.value), a.updateVariableSettingView(b));
  };
  b.minValueInput = e;
  d.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entryVariableSettingMaxValueSpanWorkspace");
  f.innerHTML = Lang.Workspace.max_value;
  d.appendChild(f);
  var g = Entry.createElement("input");
  g.addClass("entryVariableSettingMaxValueInputWorkspace");
  g.value = c && "slide" == c.type ? c.maxValue_ : 100;
  g.onblur = function(b) {
    isNaN(this.value) || (b = a.selectedVariable, b.setMaxValue(this.value), a.updateVariableSettingView(b));
  };
  b.maxValueInput = g;
  d.appendChild(g);
};
Entry.VariableContainer.prototype.updateVariableSettingView = function(a) {
  var b = this.variableSettingView, d = b.visibleCheck, c = b.initValueInput, e = b.slideCheck, f = b.minValueInput, g = b.maxValueInput, h = b.minMaxWrapper;
  d.removeClass("entryVariableSettingChecked");
  a.isVisible() && d.addClass("entryVariableSettingChecked");
  e.removeClass("entryVariableSettingChecked");
  "slide" == a.getType() ? (e.addClass("entryVariableSettingChecked"), f.removeAttribute("disabled"), g.removeAttribute("disabled"), f.value = a.getMinValue(), g.value = a.getMaxValue(), h.removeClass("entryVariableMinMaxDisabledWorkspace")) : (h.addClass("entryVariableMinMaxDisabledWorkspace"), f.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
  c.value = a.getValue();
  a.listElement.appendChild(b);
  b.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.generateListSettingView = function() {
  var a = this, b = Entry.createElement("div");
  b.bindOnClick(function(b) {
    b.stopPropagation();
  });
  this.listSettingView = b;
  b.addClass("entryListSettingWorkspace");
  this.listView_.appendChild(b);
  b.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryListSettingVisibleWrapperWorkspace");
  d.bindOnClick(function(b) {
    b = a.selectedList;
    var d = a.listSettingView.visibleCheck;
    b.setVisible(!b.isVisible());
    b.isVisible() ? d.addClass("entryListSettingCheckedWorkspace") : d.removeClass("entryListSettingCheckedWorkspace");
  });
  b.appendChild(d);
  var c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.show_list_workspace;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryListSettingCheckWorkspace");
  b.visibleCheck = c;
  d.appendChild(c);
  c = Entry.createElement("div");
  c.addClass("entryListSettingLengthWrapperWorkspace");
  d = Entry.createElement("span");
  d.addClass("entryListSettingLengthSpanWorkspace");
  d.innerHTML = Lang.Workspace.number_of_list;
  c.appendChild(d);
  b.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryListSettingLengthControllerWorkspace");
  c.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryListSettingMinusWorkspace");
  c.bindOnClick(function(b) {
    a.selectedList.array_.pop();
    a.updateListSettingView(a.selectedList);
  });
  d.appendChild(c);
  c = Entry.createElement("input");
  c.addClass("entryListSettingLengthInputWorkspace");
  c.onblur = function() {
    a.setListLength(this.value);
  };
  c.onkeypress = function(b) {
    13 == b.keyCode && this.blur();
  };
  b.lengthInput = c;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryListSettingPlusWorkspace");
  c.bindOnClick(function(b) {
    a.selectedList.array_.push({data:0});
    a.updateListSettingView(a.selectedList);
  });
  d.appendChild(c);
  d = Entry.createElement("div");
  b.seperator = d;
  b.appendChild(d);
  d.addClass("entryListSettingSeperatorWorkspace");
  d = Entry.createElement("div");
  d.addClass("entryListSettingListValuesWorkspace");
  b.listValues = d;
  b.appendChild(d);
};
Entry.VariableContainer.prototype.updateListSettingView = function(a) {
  var b = this;
  a = a || this.selectedList;
  var d = this.listSettingView, c = d.listValues, e = d.visibleCheck, f = d.lengthInput, g = d.seperator;
  e.removeClass("entryListSettingCheckedWorkspace");
  a.isVisible() && e.addClass("entryListSettingCheckedWorkspace");
  f.value = a.array_.length;
  for (a.listElement.appendChild(d);c.firstChild;) {
    c.removeChild(c.firstChild);
  }
  var h = a.array_;
  0 === h.length ? g.addClass("entryRemove") : g.removeClass("entryRemove");
  for (e = 0;e < h.length;e++) {
    (function(d) {
      var e = Entry.createElement("div");
      e.addClass("entryListSettingValueWrapperWorkspace");
      var f = Entry.createElement("span");
      f.addClass("entryListSettingValueNumberSpanWorkspace");
      f.innerHTML = d + 1;
      e.appendChild(f);
      f = Entry.createElement("input");
      f.value = h[d].data;
      f.onblur = function() {
        h[d].data = this.value;
        a.updateView();
      };
      f.onkeypress = function(b) {
        13 == b.keyCode && this.blur();
      };
      f.addClass("entryListSettingEachInputWorkspace");
      e.appendChild(f);
      f = Entry.createElement("span");
      f.bindOnClick(function() {
        h.splice(d, 1);
        b.updateListSettingView();
      });
      f.addClass("entryListSettingValueRemoveWorkspace");
      e.appendChild(f);
      c.appendChild(e);
    })(e);
  }
  a.updateView();
  d.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.setListLength = function(a) {
  a = Number(a);
  var b = this.selectedList.array_;
  if (!isNaN(a)) {
    var d = b.length;
    if (d < a) {
      for (a -= d, d = 0;d < a;d++) {
        b.push({data:0});
      }
    } else {
      d > a && (b.length = a);
    }
  }
  this.updateListSettingView();
};
Entry.VariableContainer.prototype.updateViews = function() {
  var a = this.lists_;
  this.variables_.map(function(b) {
    b.updateView();
  });
  a.map(function(b) {
    b.updateView();
  });
};
Entry.VariableContainer.prototype.updateSelectedVariable = function(a, b) {
  a ? "variable" == a.type ? (this.selectedVariable = a, this.updateVariableSettingView(a)) : "slide" == a.type ? (this.selectedVariable = a, this.updateVariableSettingView(a)) : "list" == a.type && (this.selectedList = a, this.updateListSettingView(a)) : (this.selectedVariable = null, "variable" == (b || "variable") ? this.variableSettingView.addClass("entryRemove") : this.listSettingView.addClass("entryRemove"));
};
Entry.VariableContainer.prototype.removeLocalVariables = function(a) {
  var b = [], d = this;
  this.mapVariable(function(a, d) {
    a.object_ && a.object_ == d && b.push(a);
  }, a);
  b.map(function(b) {
    d.removeVariable(b);
  });
};
Entry.VariableContainer.prototype.updateCloudVariables = function() {
  var a = Entry.projectId;
  if (Entry.cloudSavable && a) {
    var b = Entry.variableContainer, a = b.variables_.filter(function(b) {
      return b.isCloud_;
    }), a = a.map(function(b) {
      return b.toJSON();
    }), b = b.lists_.filter(function(b) {
      return b.isCloud_;
    }), b = b.map(function(b) {
      return b.toJSON();
    });
    $.ajax({url:"/api/project/variable/" + Entry.projectId, type:"PUT", data:{variables:a, lists:b}}).done(function() {
    });
  }
};
Entry.VariableContainer.prototype.addRef = function(a, b) {
  if (this.view_ && Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    var d = {object:b.getCode().object, block:b};
    b.funcBlock && (d.funcBlock = b.funcBlock, delete b.funcBlock);
    this[a].push(d);
    if ("_functionRefs" == a) {
      a = b.type.substr(5);
      for (var c = Entry.variableContainer.functions_[a].content.getBlockList(), e = 0;e < c.length;e++) {
        b = c[e];
        var f = b.events;
        -1 < b.type.indexOf("func_") && b.type.substr(5) == a || (f && f.viewAdd && f.viewAdd.forEach(function(a) {
          b.getCode().object = d.object;
          a && (b.funcBlock = d.block, a(b));
        }), f && f.dataAdd && f.dataAdd.forEach(function(a) {
          b.getCode().object = d.object;
          a && (b.funcBlock = d.block, a(b));
        }));
      }
    }
    return d;
  }
};
Entry.VariableContainer.prototype.removeRef = function(a, b) {
  if (Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    for (var d = this[a], c = 0;c < d.length;c++) {
      if (d[c].block == b) {
        d.splice(c, 1);
        break;
      }
    }
    if ("_functionRefs" == a && (a = b.type.substr(5), c = Entry.variableContainer.functions_[a])) {
      for (d = c.content.getBlockList(), c = 0;c < d.length;c++) {
        b = d[c];
        var e = b.events;
        -1 < b.type.indexOf("func_") && b.type.substr(5) == a || (e && e.viewDestroy && e.viewDestroy.forEach(function(a) {
          a && a(b);
        }), e && e.dataDestroy && e.dataDestroy.forEach(function(a) {
          a && a(b);
        }));
      }
    }
  }
};
Entry.VariableContainer.prototype._getBlockMenu = function() {
  return Entry.playground.mainWorkspace.getBlockMenu();
};
Entry.block.run = {skeleton:"basic", color:"#3BBD70", contents:["this is", "basic block"], func:function() {
}};
Entry.block.mutant = {skeleton:"basic", event:"start", color:"#3BBD70", template:"test mutant block", params:[], func:function() {
}, changeEvent:new Entry.Event};
Entry.block.jr_start = {skeleton:"pebble_event", event:"start", color:"#3BBD70", template:"%1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_play_image.png", highlightColor:"#3BBD70", position:{x:0, y:0}, size:22}], func:function() {
  var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b;
  for (b in a) {
    this._unit = a[b];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_repeat = {skeleton:"pebble_loop", color:"#127CDB", template:"%1 \ubc18\ubcf5", params:[{type:"Text", text:Lang.Menus.repeat_0}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:3, fontSize:14, roundValue:3}, {type:"Text", text:Lang.Menus.repeat_1}], statements:[], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var a = this.block.statements[0];
    if (0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  } else {
    delete this.repeatCount;
  }
}};
Entry.block.jr_item = {skeleton:"pebble_basic", color:"#F46C6C", template:"\uaf43 \ubaa8\uc73c\uae30 %1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_item_image.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.cparty_jr_item = {skeleton:"pebble_basic", color:"#8ABC1D", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.pick_up_pencil}, {type:"Indicator", img:"/img/assets/ntry/bitmap/cpartyjr/pen.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_north = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_up}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_up_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = Ntry.STATIC, b = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          b.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case Ntry.STATIC.EAST:
        c = a.TURN_LEFT;
        break;
      case Ntry.STATIC.SOUTH:
        c = a.HALF_ROTATION;
        break;
      case Ntry.STATIC.WEST:
        c = a.TURN_RIGHT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_east = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_right}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_right_image.png", position:{x:83, y:0}, size:22}], func:function() {
  var a = Ntry.STATIC;
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", a.WALK, function() {
          b.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case a.SOUTH:
        c = a.TURN_LEFT;
        break;
      case a.WEST:
        c = a.HALF_ROTATION;
        break;
      case a.NORTH:
        c = a.TURN_RIGHT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_south = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_down}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_down_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = Ntry.STATIC, b = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          b.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case a.EAST:
        c = a.TURN_RIGHT;
        break;
      case a.NORTH:
        c = a.HALF_ROTATION;
        break;
      case a.WEST:
        c = a.TURN_LEFT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_west = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_left}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_left_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = Ntry.STATIC, b = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", a.WALK, function() {
          b.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case a.SOUTH:
        c = a.TURN_RIGHT;
        break;
      case a.EAST:
        c = a.HALF_ROTATION;
        break;
      case a.NORTH:
        c = a.TURN_LEFT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_start_basic = {skeleton:"basic_event", event:"start", color:"#3BBD70", template:"%1 %2", params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}, Lang.Menus.maze_when_run], func:function() {
  var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b;
  for (b in a) {
    this._unit = a[b];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_go_straight = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.go_forward, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_straight.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_left = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_left, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_l.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_right = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_right, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_r.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_go_slow = {skeleton:"basic", color:"#f46c6c", template:"%1 %2", params:[Lang.Menus.go_slow, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_slow.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GO_SLOW, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_repeat_until_dest = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", syntax:["BasicWhile", "true"], params:[Lang.Menus.repeat_until_reach_2, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_goal_image.png", size:18}, Lang.Menus.repeat_until_reach_1, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var a = this.block.statements[0];
  if (0 !== a.getBlocks().length) {
    return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_if_construction = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", params:[Lang.Menus.jr_if_1, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_construction_image.png", size:18}, Lang.Menus.jr_if_2, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, d;
    for (d in a) {
      b = a[d];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_REPAIR});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.jr_if_speed = {skeleton:"basic_loop", color:"#498DEB", template:Lang.Menus.jr_if_1 + " %1 " + Lang.Menus.jr_if_2 + " %2", params:[{type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_speed_image.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, d;
    for (d in a) {
      b = a[d];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_SLOW});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_start = {skeleton:"basic_event", mode:"maze", event:"start", color:"#3BBD70", template:"%1 \uc2dc\uc791\ud558\uae30\ub97c \ud074\ub9ad\ud588\uc744 \ub54c", syntax:["Program"], params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}], func:function() {
  var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b;
  for (b in a) {
    this._unit = a[b];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.maze_step_jump = {skeleton:"basic", mode:"maze", color:"#FF6E4B", template:"\ub6f0\uc5b4\ub118\uae30%1", params:[{type:"Image", img:"/img/assets/week/blocks/jump.png", size:24}], syntax:["Scope", "jump"], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.JUMP, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_for = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ubc88 \ubc18\ubcf5\ud558\uae30%2", syntax:["BasicIteration"], params:[{type:"Dropdown", key:"REPEAT", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var a = this.block.statements[0];
    if (0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  } else {
    delete this.repeatCount;
  }
}};
Entry.block.test = {skeleton:"basic_boolean_field", mode:"maze", color:"#127CDB", template:"%1 this is test block %2", params:[{type:"Angle", value:"90"}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.maze_repeat_until_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var a = this.block.statements[0];
  if (0 !== a.getBlocks().length) {
    return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_repeat_until_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ubaa8\ub4e0 %1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var a = this.block.statements[0];
  if (0 !== a.getBlocks().length) {
    return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, d;
    for (d in a) {
      b = a[d];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    d = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y});
    a = this.block.statements[0];
    if (0 === d.length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "bee"'], params:[{type:"Image", img:"/img/assets/ntry/bitmap/maze2/obstacle_01.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, d;
    for (d in a) {
      b = a[d];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BEE});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_call_function = {skeleton:"basic", mode:"maze", color:"#B57242", template:"\uc57d\uc18d \ubd88\ub7ec\uc624\uae30%1", syntax:["Scope", "promise"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], func:function() {
  if (!this.funcExecutor) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.CODE), b;
    for (b in a) {
      this.funcExecutor = new Entry.Executor(a[b].components[Ntry.STATIC.CODE].code.getEventMap("define")[0]);
    }
  }
  this.funcExecutor.execute();
  if (null !== this.funcExecutor.scope.block) {
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_define_function = {skeleton:"basic_define", mode:"maze", color:"#B57242", event:"define", template:"\uc57d\uc18d\ud558\uae30%1", syntax:["BasicFunction"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], statements:[{accept:"basic"}], func:function(a) {
  if (!this.executed && (a = this.block.statements[0], 0 !== a.getBlocks().length)) {
    return this.executor.stepInto(a), this.executed = !0, Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_3 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "banana"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_3.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, d;
    for (d in a) {
      b = a[d];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BANANA});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_4 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_2.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, d;
    for (d in a) {
      b = a[d];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_move_step = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc55e\uc73c\ub85c \ud55c \uce78 \uc774\ub3d9%1", syntax:["Scope", "move"], params:[{type:"Image", img:"/img/assets/week/blocks/moveStep.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_left = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc67c\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "left"], params:[{type:"Image", img:"/img/assets/week/blocks/turnL.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_right = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc624\ub978\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "right"], params:[{type:"Image", img:"/img/assets/week/blocks/turnR.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.test_wrapper = {skeleton:"basic", mode:"maze", color:"#3BBD70", template:"%1 this is test block %2", params:[{type:"Block", accept:"basic_boolean_field", value:[{type:"test", params:[30, 50]}]}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.basic_button = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"basic button", color:"#333", align:"center"}], func:function() {
}};
Entry.Thread = function(a, b, d) {
  this._data = new Entry.Collection;
  this._code = b;
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this.handleChange);
  this._event = null;
  this.parent = d ? d : b;
  this.load(a);
};
(function(a) {
  a.load = function(b, a) {
    void 0 === b && (b = []);
    if (!(b instanceof Array)) {
      return console.error("thread must be array");
    }
    for (var c = 0;c < b.length;c++) {
      var e = b[c];
      e instanceof Entry.Block || e.isDummy ? (e.setThread(this), this._data.push(e)) : this._data.push(new Entry.Block(e, this));
    }
    (b = this._code.view) && this.createView(b.board, a);
  };
  a.registerEvent = function(b, a) {
    this._event = a;
    this._code.registerEvent(b, a);
  };
  a.unregisterEvent = function(b, a) {
    this._code.unregisterEvent(b, a);
  };
  a.createView = function(b, a) {
    this.view || (this.view = new Entry.ThreadView(this, b));
    this._data.map(function(c) {
      c.createView(b, a);
    });
  };
  a.separate = function(b, a) {
    this._data.has(b.id) && (b = this._data.splice(this._data.indexOf(b), a), this._code.createThread(b), this.changeEvent.notify());
  };
  a.cut = function(b) {
    b = this._data.indexOf(b);
    b = this._data.splice(b);
    this.changeEvent.notify();
    return b;
  };
  a.insertByBlock = function(b, a) {
    b = b ? this._data.indexOf(b) : -1;
    for (var c = 0;c < a.length;c++) {
      a[c].setThread(this);
    }
    this._data.splice.apply(this._data, [b + 1, 0].concat(a));
    this.changeEvent.notify();
  };
  a.insertToTop = function(b) {
    b.setThread(this);
    this._data.unshift.apply(this._data, [b]);
    this.changeEvent.notify();
  };
  a.clone = function(b, a) {
    b = b || this._code;
    b = new Entry.Thread([], b);
    for (var c = this._data, e = [], f = 0, g = c.length;f < g;f++) {
      e.push(c[f].clone(b));
    }
    b.load(e, a);
    return b;
  };
  a.toJSON = function(b, a) {
    var c = [];
    for (a = void 0 === a ? 0 : a;a < this._data.length;a++) {
      this._data[a] instanceof Entry.Block && c.push(this._data[a].toJSON(b));
    }
    return c;
  };
  a.destroy = function(b) {
    this._code.destroyThread(this, !1);
    this.view && this.view.destroy(b);
    for (var a = this._data, c = a.length - 1;0 <= c;c--) {
      a[c].destroy(b);
    }
  };
  a.getBlock = function(b) {
    return this._data[b];
  };
  a.getBlocks = function() {
    return this._data.map(function(b) {
      return b;
    });
  };
  a.countBlock = function() {
    for (var b = 0, a = 0;a < this._data.length;a++) {
      var c = this._data[a];
      if (c.type && (b++, c = c.statements)) {
        for (var e = 0;e < c.length;e++) {
          b += c[e].countBlock();
        }
      }
    }
    return b;
  };
  a.handleChange = function() {
    0 === this._data.length && this.destroy();
  };
  a.getCode = function() {
    return this._code;
  };
  a.setCode = function(b) {
    this._code = b;
  };
  a.spliceBlock = function(b) {
    var a = this._data;
    a.remove(b);
    0 === a.length && this.view.getParent().constructor !== Entry.FieldStatement && this.destroy();
    this.changeEvent.notify();
  };
  a.getFirstBlock = function() {
    return this._data[0];
  };
  a.getPrevBlock = function(b) {
    b = this._data.indexOf(b);
    return this._data.at(b - 1);
  };
  a.getNextBlock = function(b) {
    b = this._data.indexOf(b);
    return this._data.at(b + 1);
  };
  a.getLastBlock = function() {
    return this._data.at(this._data.length - 1);
  };
  a.getRootBlock = function() {
    return this._data.at(0);
  };
  a.hasBlockType = function(b) {
    function a(c) {
      if (b == c.type) {
        return !0;
      }
      for (var f = c.params, g = 0;g < f.length;g++) {
        var h = f[g];
        if (h && h.constructor == Entry.Block && a(h)) {
          return !0;
        }
      }
      if (c = c.statements) {
        for (f = 0;f < c.length;f++) {
          if (c[f].hasBlockType(b)) {
            return !0;
          }
        }
      }
      return !1;
    }
    for (var c = 0;c < this._data.length;c++) {
      if (a(this._data[c])) {
        return !0;
      }
    }
    return !1;
  };
  a.getCount = function(b) {
    var a = this._data.length;
    b && (a -= this._data.indexOf(b));
    return a;
  };
  a.indexOf = function(b) {
    return this._data.indexOf(b);
  };
  a.pointer = function(b, a) {
    a = this.indexOf(a);
    b.unshift(a);
    this.parent instanceof Entry.Block && b.unshift(this.parent.indexOfStatements(this));
    return this._code === this.parent ? (b.unshift(this._code.indexOf(this)), a = this._data[0], b.unshift(a.y), b.unshift(a.x), b) : this.parent.pointer(b);
  };
  a.getBlockList = function(b) {
    for (var a = [], c = 0;c < this._data.length;c++) {
      a = a.concat(this._data[c].getBlockList(b));
    }
    return a;
  };
})(Entry.Thread.prototype);
Entry.skeleton = function() {
};
Entry.skeleton.basic = {path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(30, a + 2);
  b = Math.max(0, b + 9 - a / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, box:function(a) {
  return {offsetX:-8, offsetY:0, width:(a ? a.contentWidth : 150) + 30, height:Math.max(30, (a ? a.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(a) {
  return {previous:{x:0, y:0}, next:{x:0, y:(a ? Math.max(a.height, 30) : 30) + 1 + a.offsetY}};
}, contentPos:function(a) {
  return {x:14, y:Math.max(a.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_create = {path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(30, a + 2);
  b = Math.max(0, b + 9 - a / 2);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, box:function(a) {
  return {offsetX:-8, offsetY:0, width:(a ? a.contentWidth : 150) + 30, height:Math.max(30, (a ? a.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(a) {
  return {next:{x:0, y:(a ? Math.max(a.height, 30) : 30) + 1 + a.offsetY}};
}, contentPos:function(a) {
  return {x:14, y:Math.max(a.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_event = {path:function(a) {
  a = a.contentWidth;
  a = Math.max(0, a);
  return "m -8,0 m 0,-5 a 19.5,19.5 0, 0,1 16,0 c 10,5 15,5 20,5 h %w a 15,15 0 0,1 0,30 H 8 l -8,8 -8,-8 l 0,0.5 a 19.5,19.5 0, 0,1 0,-35 z".replace(/%w/gi, a - 30);
}, box:function(a) {
  return {offsetX:-19, offsetY:-7, width:a.contentWidth + 30, height:30, marginBottom:0};
}, magnets:function(a) {
  return {next:{x:0, y:(a ? Math.max(a.height + a.offsetY + 7, 30) : 30) + 1}};
}, contentPos:function(a) {
  return {x:1, y:15};
}};
Entry.skeleton.basic_loop = {path:function(a) {
  var b = a.contentWidth, d = a.contentHeight, d = Math.max(30, d + 2), b = Math.max(0, b + 9 - d / 2);
  a = a._statements[0] ? a._statements[0].height : 20;
  a = Math.max(a, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh/gi, d).replace(/%w/gi, b).replace(/%bw/gi, b - 8).replace(/%h/gi, d / 2).replace(/%sh/gi, a + 1);
}, magnets:function(a) {
  var b = Math.max(a.contentHeight + 2, 30), d = a._statements[0] ? a._statements[0].height : 20, d = Math.max(d, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:d + b + 18 + a.offsetY}};
}, box:function(a) {
  var b = a.contentWidth, d = Math.max(a.contentHeight + 2, 30);
  a = a._statements[0] ? a._statements[0].height : 20;
  a = Math.max(a, 20);
  return {offsetX:-8, offsetY:0, width:b + 30, height:d + a + 17, marginBottom:0};
}, statementPos:function(a) {
  return [{x:16, y:Math.max(30, a.contentHeight + 2) + 1}];
}, contentPos:function(a) {
  return {x:14, y:Math.max(a.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_define = {path:function(a) {
  var b = a.contentWidth, d = a.contentHeight, d = Math.max(30, d + 2), b = Math.max(0, b + 9 - d / 2);
  a = a._statements[0] ? a._statements[0].height : 30;
  a = Math.max(a, 20);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H -8 z".replace(/%wh/gi, d).replace(/%w/gi, b).replace(/%h/gi, d / 2).replace(/%bw/gi, b - 8).replace(/%sh/gi, a + 1);
}, magnets:function() {
  return {};
}, box:function(a) {
  return {offsetX:0, offsetY:0, width:a.contentWidth, height:Math.max(a.contentHeight, 25) + 46, marginBottom:0};
}, statementPos:function(a) {
  return [{x:16, y:Math.max(30, a.contentHeight + 2)}];
}, contentPos:function() {
  return {x:14, y:15};
}};
Entry.skeleton.pebble_event = {path:function(a) {
  return "m 0,0 a 25,25 0 0,1 9,48.3 a 9,9 0 0,1 -18,0 a 25,25 0 0,1 9,-48.3 z";
}, box:function(a) {
  return {offsetX:-25, offsetY:0, width:50, height:48.3, marginBottom:0};
}, magnets:function(a) {
  return {next:{x:0, y:(a ? Math.max(a.height, 49.3) : 49.3) + a.offsetY}};
}, contentPos:function() {
  return {x:0, y:25};
}};
Entry.skeleton.pebble_loop = {fontSize:16, dropdownHeight:23, path:function(a) {
  a = Math.max(a._statements[0] ? a._statements[0].height : 50, 50);
  return "M 0,9 a 9,9 0 0,0 9,-9 h %cw q 25,0 25,25 v %ch q 0,25 -25,25 h -%cw a 9,9 0 0,1 -18,0 h -%cw q -25,0 -25,-25 v -%ch q 0,-25 25,-25 h %cw a 9,9 0 0,0 9,9 M 0,49 a 9,9 0 0,1 -9,-9 h -28 a 25,25 0 0,0 -25,25 v %cih a 25,25 0 0,0 25,25 h 28 a 9,9 0 0,0 18,0 h 28 a 25,25 0 0,0 25,-25 v -%cih a 25,25 0 0,0 -25,-25 h -28 a 9,9 0 0,1 -9,9 z".replace(/%cw/gi, 41).replace(/%ch/gi, a + 4).replace(/%cih/gi, a - 50);
}, magnets:function(a) {
  var b = Math.max(a.contentHeight + 2, 41), d = a._statements[0] ? a._statements[0].height : 20, d = Math.max(d, 51);
  return {previous:{x:0, y:0}, next:{x:0, y:d + b + 13 + a.offsetY}};
}, box:function(a) {
  var b = a.contentWidth, d = Math.max(a.contentHeight + 2, 41);
  a = a._statements[0] ? a._statements[0].height : 20;
  a = Math.max(a, 51);
  return {offsetX:-(b / 2 + 13), offsetY:0, width:b + 30, height:d + a + 13, marginBottom:0};
}, statementPos:function(a) {
  return [{x:0, y:Math.max(39, a.contentHeight + 2) + 1.5}];
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.pebble_basic = {fontSize:15, morph:["prev", "next"], path:function(a) {
  return "m 0,9 a 9,9 0 0,0 9,-9 h 28 q 25,0 25,25q 0,25 -25,25h -28 a 9,9 0 0,1 -18,0 h -28 q -25,0 -25,-25q 0,-25 25,-25h 28 a 9,9 0 0,0 9,9 z";
}, magnets:function(a) {
  return {previous:{x:0, y:0}, next:{x:0, y:(a ? Math.max(a.height, 51) : 51) + a.offsetY}};
}, box:function() {
  return {offsetX:-62, offsetY:0, width:124, height:50, marginBottom:0};
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.basic_string_field = {path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(18, a + 2);
  b = Math.max(0, b - a + 12);
  return "m %h,0 h %w a %h,%h 0 1,1 0,%wh H %h A %h,%h 0 1,1 %h,0 z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, color:"#000", outerLine:"#768dce", box:function(a) {
  return {offsetX:0, offsetY:0, width:(a ? a.contentWidth : 5) + 12, height:Math.max((a ? a.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {string:{}};
}, contentPos:function(a) {
  return {x:6, y:Math.max(a.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_boolean_field = {path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(18, a + 2);
  b = Math.max(0, b - a + 19);
  return "m %h,0 h %w l %h,%h -%h,%h H %h l -%h,-%h %h,-%h z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, color:"#000", outerLine:"#768dce", box:function(a) {
  return {offsetX:0, offsetY:0, width:(a ? a.contentWidth : 5) + 19, height:Math.max((a ? a.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {boolean:{}};
}, contentPos:function(a) {
  return {x:10, y:Math.max(a.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_param = {path:function(a) {
  var b = a.contentWidth;
  (a = a._contents[a._contents.length - 1]) && (b -= a.box.width + Entry.BlockView.PARAM_SPACE - 2);
  b = Math.max(0, b);
  return "m 4,0 h 10 h %w l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2h -%w h -10 l -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2".replace(/%w/gi, b);
}, outerLine:"#768dce", box:function(a) {
  return {offsetX:0, offsetY:0, width:(a ? a.contentWidth : 5) + 11, height:24, marginBottom:0};
}, magnets:function() {
  return {param:{}};
}, contentPos:function(a) {
  return {x:11, y:12};
}};
Entry.skeleton.basic_button = {path:function() {
  return "m -64,0 h 128 a 6,6 0, 0,1 6,6 v 18 a 6,6 0, 0,1 -6,6 h -128 a 6,6 0, 0,1 -6,-6 v -18 a 6,6 0, 0,1 6,-6 z";
}, box:function() {
  return {offsetX:-80, offsetY:0, width:140, height:30};
}, contentPos:function() {
  return {x:0, y:15};
}, movable:!1, readOnly:!0, nextShadow:!0, classes:["basicButtonView"]};
Entry.skeleton.basic_without_next = {box:Entry.skeleton.basic.box, contentPos:Entry.skeleton.basic.contentPos, path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(30, a + 2);
  b = Math.max(0, b + 9 - a / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0, %wh H -8 z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, magnets:function(a) {
  return {previous:{x:0, y:0}};
}};
Entry.skeleton.basic_double_loop = {path:function(a) {
  var b = a.contentWidth, d = a.contentHeight % 1E3, c = Math.floor(a.contentHeight / 1E3), d = Math.max(30, d + 2), c = Math.max(30, c + 2), b = Math.max(0, b + 5 - d / 2), e = a._statements;
  a = e[0] ? e[0].height : 20;
  e = e[1] ? e[1].height : 20;
  a = Math.max(a, 20);
  e = Math.max(e, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h1,%h1 0 0,1 0,%wh1 H 24 l -8,8 -8,-8 h -0.4 v %sh1 h 0.4 l 8,8 8,-8 h %bw a %h2,%h2 0 0,1 0,%wh2 H 24 l -8,8 -8,-8 h -0.4 v %sh2 h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh1/gi, d).replace(/%wh2/gi, c).replace(/%w/gi, b).replace(/%bw/gi, b - 8).replace(/%h1/gi, d / 2).replace(/%h2/gi, c / 2).replace(/%sh1/gi, a + 1).replace(/%sh2/gi, e + 1);
}, magnets:function(a) {
  var b = Math.max(a.contentHeight % 1E3 + 2, 30), d = Math.max(Math.floor(a.contentHeight / 1E3) + 2, 30), c = a._statements[0] ? a._statements[0].height : 20, e = a._statements[1] ? a._statements[1].height : 20, c = Math.max(c, 20), e = Math.max(e, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:c + e + b + d + 19 + a.offsetY}};
}, box:function(a) {
  var b = a.contentWidth, d = Math.max(Math.floor(a.contentHeight / 1E3) + 2, 30), c = Math.max(a.contentHeight % 1E3 + 2, 30), e = a._statements[0] ? a._statements[0].height % 1E3 : 20;
  a = a._statements[1] ? a._statements[1].height : 20;
  e = Math.max(e, 20);
  a = Math.max(a, 20);
  return {offsetX:-8, offsetY:0, width:b + 30, height:d + c + e + a + 17, marginBottom:0};
}, statementPos:function(a) {
  var b = Math.max(30, a.contentHeight % 1E3 + 2) + 1;
  return [{x:16, y:b}, {x:16, y:b + Math.max(a._statements[0] ? a._statements[0].height % 1E3 : 20, 20) + Math.max(Math.floor(a.contentHeight / 1E3) + 2, 30) + 1}];
}, contentPos:function(a) {
  return {x:14, y:Math.max(a.contentHeight % 1E3, 28) / 2 + 1};
}};
Entry.Block = function(a, b) {
  var d = this;
  Entry.Model(this, !1);
  this._schema = null;
  this.setThread(b);
  this.load(a);
  a = this.getCode();
  a.registerBlock(this);
  (b = this.events.dataAdd) && a.object && b.forEach(function(b) {
    Entry.Utils.isFunction(b) && b(d);
  });
};
Entry.Block.MAGNET_RANGE = 10;
Entry.Block.MAGNET_OFFSET = .4;
Entry.Block.DELETABLE_TRUE = 1;
Entry.Block.DELETABLE_FALSE = 2;
Entry.Block.DELETABLE_FALSE_LIGHTEN = 3;
(function(a) {
  a.schema = {id:null, x:0, y:0, type:null, params:[], statements:[], view:null, thread:null, movable:null, deletable:Entry.Block.DELETABLE_TRUE, readOnly:null, copyable:!0, events:{}};
  a.load = function(b) {
    b.id || (b.id = Entry.Utils.generateId());
    this.set(b);
    this.loadSchema();
  };
  a.changeSchema = function(b) {
    this.set({params:[]});
    this.loadSchema();
  };
  a.getSchema = function() {
    this._schema || this.loadSchema();
    return this._schema;
  };
  a.loadSchema = function() {
    if (this._schema = Entry.block[this.type]) {
      !this._schemaChangeEvent && this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this.changeSchema));
      var b = this._schema.events;
      if (b) {
        for (var a in b) {
          this.events[a] || (this.events[a] = []);
          for (var c = b[a], e = 0;e < c.length;e++) {
            var f = c[e];
            f && 0 > this.events[a].indexOf(f) && this.events[a].push(f);
          }
        }
      }
      this._schema.event && this.thread.registerEvent(this, this._schema.event);
      b = this.params;
      a = this._schema.params;
      for (e = 0;a && e < a.length;e++) {
        c = void 0 === b[e] || null === b[e] ? a[e].value : b[e], f = b[e] || e < b.length, !c || "Output" !== a[e].type && "Block" !== a[e].type || (c = new Entry.Block(c, this.thread)), f ? b.splice(e, 1, c) : b.push(c);
      }
      if (b = this._schema.statements) {
        for (e = 0;e < b.length;e++) {
          this.statements.splice(e, 1, new Entry.Thread(this.statements[e], this.getCode(), this));
        }
      }
    }
  };
  a.changeType = function(b) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this.set({type:b});
    this.loadSchema();
    this.view && this.view.changeType(b);
  };
  a.setThread = function(b) {
    this.set({thread:b});
  };
  a.getThread = function() {
    return this.thread;
  };
  a.insertAfter = function(b) {
    this.thread.insertByBlock(this, b);
  };
  a._updatePos = function() {
    this.view && this.set({x:this.view.x, y:this.view.y});
  };
  a.moveTo = function(b, a) {
    this.view && this.view._moveTo(b, a);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  a.createView = function(b, a) {
    this.view || (this.set({view:new Entry.BlockView(this, b, a)}), this._updatePos());
  };
  a.clone = function(b) {
    return new Entry.Block(this.toJSON(!0), b);
  };
  a.toJSON = function(b) {
    var a = this._toJSON();
    delete a.view;
    delete a.thread;
    delete a.events;
    b && delete a.id;
    a.params = a.params.map(function(a) {
      a instanceof Entry.Block && (a = a.toJSON(b));
      return a;
    });
    a.statements = a.statements.map(function(a) {
      return a.toJSON(b);
    });
    a.x = this.x;
    a.y = this.y;
    a.movable = this.movable;
    a.deletable = this.deletable;
    a.readOnly = this.readOnly;
    return a;
  };
  a.destroy = function(b, a) {
    var c = this, e = this.params;
    if (e) {
      for (var f = 0;f < e.length;f++) {
        var g = e[f];
        g instanceof Entry.Block && (g.doNotSplice = !0, g.destroy(b));
      }
    }
    if (e = this.statements) {
      for (f = 0;f < e.length;f++) {
        e[f].destroy(b);
      }
    }
    g = this.getPrevBlock();
    f = this.getNextBlock();
    this.getCode().unregisterBlock(this);
    e = this.getThread();
    this._schema.event && e.unregisterEvent(this, this._schema.event);
    f && (a ? f.destroy(b, a) : g ? f.view.bindPrev(g) : (a = this.getThread().view.getParent(), a.constructor === Entry.FieldStatement ? (f.view.bindPrev(a), a.insertTopBlock(f)) : a.constructor === Entry.FieldStatement ? f.replace(a._valueBlock) : f.view._toGlobalCoordinate()));
    this.doNotSplice ? delete this.doNotSplice : e.spliceBlock(this);
    this.view && this.view.destroy(b);
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    (b = this.events.dataDestroy) && this.getCode().object && b.forEach(function(b) {
      Entry.Utils.isFunction(b) && b(c);
    });
  };
  a.getView = function() {
    return this.view;
  };
  a.setMovable = function(b) {
    this.movable != b && this.set({movable:b});
  };
  a.setCopyable = function(b) {
    this.copyable != b && this.set({copyable:b});
  };
  a.isMovable = function() {
    return this.movable;
  };
  a.isCopyable = function() {
    return this.copyable;
  };
  a.setDeletable = function(b) {
    this.deletable != b && this.set({deletable:b});
  };
  a.isDeletable = function() {
    return this.deletable === Entry.Block.DELETABLE_TRUE;
  };
  a.isReadOnly = function() {
    return this.readOnly;
  };
  a.getCode = function() {
    return this.thread.getCode();
  };
  a.doAdd = function() {
    this.getCode().changeEvent.notify();
  };
  a.doMove = function() {
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  a.doSeparate = function() {
    this.separate();
  };
  a.doInsert = function(b) {
    "basic" === this.getBlockType() ? this.insert(b) : this.replace(b);
  };
  a.doDestroy = function(b) {
    this.destroy(b);
    this.getCode().changeEvent.notify();
    return this;
  };
  a.doDestroyBelow = function(b) {
    console.log("destroyBelow", this.id, this.x, this.y);
    this.destroy(b, !0);
    this.getCode().changeEvent.notify();
    return this;
  };
  a.copy = function() {
    var b = this.getThread(), a = [];
    if (b instanceof Entry.Thread) {
      for (var c = b.getBlocks().indexOf(this), b = b.toJSON(!0, c), c = 0;c < b.length;c++) {
        a.push(b[c]);
      }
    } else {
      a.push(this.toJSON(!0));
    }
    b = this.view.getAbsoluteCoordinate();
    c = a[0];
    c.x = b.x + 15;
    c.y = b.y + 15;
    c.id = Entry.Utils.generateId();
    return a;
  };
  a.copyToClipboard = function() {
    Entry.clipboard = this.copy();
  };
  a.separate = function(b) {
    this.thread.separate(this, b);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  a.insert = function(b) {
    var a = this.thread.cut(this);
    b instanceof Entry.Thread ? b.insertByBlock(null, a) : b.insertAfter(a);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  a.replace = function(b) {
    this.thread.cut(this);
    b.getThread().replace(this);
    this.getCode().changeEvent.notify();
  };
  a.getPrevBlock = function() {
    return this.thread.getPrevBlock(this);
  };
  a.getNextBlock = function() {
    return this.thread.getNextBlock(this) || null;
  };
  a.getLastBlock = function() {
    return this.thread.getLastBlock();
  };
  a.getOutputBlock = function() {
    for (var b = this._schema.params, a = 0;b && a < b.length;a++) {
      if ("Output" === b[a].type) {
        return this.params[a];
      }
    }
    return null;
  };
  a.getTerminateOutputBlock = function() {
    for (var b = this;;) {
      var a = b.getOutputBlock();
      if (!a) {
        return b;
      }
      b = a;
    }
  };
  a.getBlockType = function() {
    if (!this.view) {
      return null;
    }
    var b = Entry.skeleton[this._schema.skeleton].magnets(this.view);
    return b.next || b.previous ? "basic" : b.boolean || b.string ? "field" : b.output ? "output" : null;
  };
  a.indexOfStatements = function(b) {
    return this.statements.indexOf(b);
  };
  a.pointer = function(b) {
    b || (b = []);
    return this.thread.pointer(b, this);
  };
  a.targetPointer = function() {
    var b = this.thread.pointer([], this);
    4 === b.length && 0 === b[3] && b.pop();
    return b;
  };
  a.getBlockList = function(b) {
    var a = [];
    if (!this._schema) {
      return [];
    }
    if (b && this._schema.isPrimitive) {
      return a;
    }
    a.push(this);
    for (var c = this.params, e = 0;e < c.length;e++) {
      var f = c[e];
      f && f.constructor == Entry.Block && (a = a.concat(f.getBlockList(b)));
    }
    if (c = this.statements) {
      for (e = 0;e < c.length;e++) {
        a = a.concat(c[e].getBlockList(b));
      }
    }
    return a;
  };
})(Entry.Block.prototype);
Entry.BlockMenu = function(a, b, d, c) {
  Entry.Model(this, !1);
  this._align = b || "CENTER";
  this._scroll = void 0 !== c ? c : !1;
  this._bannedClass = [];
  this._categories = [];
  this.suffix = "blockMenu";
  a = "string" === typeof a ? $("#" + a) : $(a);
  if ("DIV" !== a.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = a;
  this.visible = !0;
  this._svgId = "blockMenu" + (new Date).getTime();
  this._clearCategory();
  this._categoryData = d;
  this._generateView(d);
  this._splitters = [];
  this.setWidth();
  this.svg = Entry.SVG(this._svgId);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.patternRect = Entry.Utils.addBlockPattern(this.svg, this.suffix);
  this.svgGroup = this.svg.elem("g");
  this.svgThreadGroup = this.svgGroup.elem("g");
  this.svgThreadGroup.board = this;
  this.svgBlockGroup = this.svgGroup.elem("g");
  this.svgBlockGroup.board = this;
  this.changeEvent = new Entry.Event(this);
  d && this._generateCategoryCodes(d);
  this.observe(this, "_handleDragBlock", ["dragBlock"]);
  this._scroll && (this._scroller = new Entry.BlockMenuScroller(this), this._addControl(a));
  Entry.documentMousedown && Entry.documentMousedown.attach(this, this.setSelectedBlock);
  this._categoryCodes && Entry.keyPressed && Entry.keyPressed.attach(this, this._captureKeyEvent);
  Entry.windowResized && (a = _.debounce(this.updateOffset, 200), Entry.windowResized.attach(this, a));
};
(function(a) {
  a.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  a._generateView = function(b) {
    var a = this.view, c = this;
    b && (this._categoryCol = Entry.Dom("ul", {class:"entryCategoryListWorkspace", parent:a}), this._generateCategoryView(b));
    this.blockMenuContainer = Entry.Dom("div", {"class":"blockMenuContainer", parent:a});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="blockMenu" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.blockMenuContainer});
    this.svgDom.mouseenter(function(b) {
      c._scroller && c._scroller.setOpacity(1);
      b = c.workspace.selectedBlockView;
      !Entry.playground || Entry.playground.resizing || b && b.dragMode === Entry.DRAG_MODE_DRAG || (Entry.playground.focusBlockMenu = !0, b = c.svgGroup.getBBox(), b = b.width + b.x + 64, b > Entry.interfaceState.menuWidth && (this.widthBackup = Entry.interfaceState.menuWidth - 64, $(this).stop().animate({width:b - 62}, 200)));
    });
    this.svgDom.mouseleave(function(b) {
      Entry.playground && !Entry.playground.resizing && (c._scroller && c._scroller.setOpacity(0), (b = this.widthBackup) && $(this).stop().animate({width:b}, 200), delete this.widthBackup, delete Entry.playground.focusBlockMenu);
    });
    $(window).scroll(function() {
      c.updateOffset();
    });
  };
  a.changeCode = function(b) {
    if (!(b instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.codeListener && this.code.changeEvent.detach(this.codeListener);
    var a = this;
    this.set({code:b});
    this.codeListener = this.code.changeEvent.attach(this, function() {
      a.changeEvent.notify();
    });
    b.createView(this);
    this.workspace.getMode();
    this.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD ? b.mode && "code" !== b.mode || this.renderText() : "text" === b.mode && this.renderBlock();
    this.align();
  };
  a.bindCodeView = function(b) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = b.svgBlockGroup;
    this.svgThreadGroup = b.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
    this._scroller && this.svgGroup.appendChild(this._scroller.svgGroup);
  };
  a.align = function(b) {
    var a = this.code;
    if (a) {
      this._clearSplitters();
      a.view && !b && a.view.reDraw();
      b = a.getThreads();
      for (var a = 10, c = "LEFT" == this._align ? 10 : this.svgDom.width() / 2, e, f = 0, g = b.length;f < g;f++) {
        var h = b[f].getFirstBlock(), k = h.view, h = Entry.block[h.type];
        this.checkBanClass(h) ? k.set({display:!1}) : (k.set({display:!0}), h = h.class, e && e !== h && (this._createSplitter(a), a += 15), e = h, h = c - k.offsetX, "CENTER" == this._align && (h -= k.width / 2), a -= k.offsetY, k._moveTo(h, a, !1), a += k.height + 15);
      }
      this.updateSplitters();
      this.changeEvent.notify();
    }
  };
  a.cloneToGlobal = function(b) {
    if (!this._boardBlockView && null !== this.dragBlock) {
      var a = this.workspace, c = a.getMode(), e = this.dragBlock, f = this._svgWidth, g = a.selectedBoard;
      if (!g || c != Entry.Workspace.MODE_BOARD && c != Entry.Workspace.MODE_OVERLAYBOARD) {
        Entry.GlobalSvg.setView(e, a.getMode()) && Entry.GlobalSvg.addControl(b);
      } else {
        if (g.code && (a = e.block, c = a.getThread(), a && c)) {
          a = c.toJSON(!0);
          this._boardBlockView = Entry.do("addThread", a).value.getFirstBlock().view;
          var g = this.offset().top - g.offset().top, h, k;
          if (a = this.dragBlock.mouseDownCoordinate) {
            h = b.pageX - a.x, k = b.pageY - a.y;
          }
          this._boardBlockView._moveTo(e.x - f + (h || 0), e.y + g + (k || 0), !1);
          this._boardBlockView.onMouseDown.call(this._boardBlockView, b);
          this._boardBlockView.dragInstance.set({isNew:!0});
        }
      }
    }
  };
  a.terminateDrag = function() {
    if (this._boardBlockView) {
      var b = this._boardBlockView;
      if (b) {
        this.workspace.getBoard();
        this._boardBlockView = null;
        var a = Entry.GlobalSvg.left, c = Entry.GlobalSvg.width / 2, b = b.getBoard().offset().left;
        return a < b - c;
      }
    }
  };
  a.getCode = function(b) {
    return this._code;
  };
  a.setSelectedBlock = function(b) {
    var a = this.selectedBlockView;
    a && a.removeSelected();
    b instanceof Entry.BlockView ? b.addSelected() : b = null;
    this.set({selectedBlockView:b});
  };
  a.hide = function() {
    this.view.addClass("entryRemove");
  };
  a.show = function() {
    this.view.removeClass("entryRemove");
  };
  a.renderText = function() {
    var b = this.code.getThreads();
    this.code.mode = "text";
    for (var a = 0;a < b.length;a++) {
      b[a].view.renderText();
    }
  };
  a.renderBlock = function() {
    var b = this.code.getThreads();
    this.code.mode = "code";
    for (var a = 0;a < b.length;a++) {
      b[a].view.renderBlock();
    }
  };
  a._createSplitter = function(b) {
    b = this.svgBlockGroup.elem("line", {x1:20, y1:b, x2:this._svgWidth - 20, y2:b, stroke:"#b5b5b5"});
    this._splitters.push(b);
  };
  a.updateSplitters = function(b) {
    b = void 0 === b ? 0 : b;
    var a = this._svgWidth - 20, c;
    this._splitters.forEach(function(e) {
      c = parseFloat(e.getAttribute("y1")) + b;
      e.attr({x2:a, y1:c, y2:c});
    });
  };
  a._clearSplitters = function() {
    for (var b = this._splitters, a = b.length - 1;0 <= a;a--) {
      b[a].remove(), b.pop();
    }
  };
  a.setWidth = function() {
    this._svgWidth = this.blockMenuContainer.width();
    this.updateSplitters();
  };
  a.setMenu = function() {
    var b = this._categoryCodes, a = this._categoryElems, c;
    for (c in b) {
      for (var e = b[c], e = e instanceof Entry.Code ? e.getThreads() : e, f = e.length, g = 0;g < e.length;g++) {
        var h = e[g], h = h instanceof Entry.Thread ? h.getFirstBlock().type : h[0].type;
        this.checkBanClass(Entry.block[h]) && f--;
      }
      0 === f ? a[c].addClass("entryRemove") : a[c].removeClass("entryRemove");
    }
  };
  a.getCategoryCodes = function(b) {
    b = this._convertSelector(b);
    var a = this._categoryCodes[b];
    a || (a = []);
    a instanceof Entry.Code || (a = this._categoryCodes[b] = new Entry.Code(a));
    return a;
  };
  a._convertSelector = function(b) {
    if (isNaN(b)) {
      return b;
    }
    b = Number(b);
    for (var a = this._categories, c = this._categoryElems, e = 0;e < a.length;e++) {
      var f = a[e];
      if (!c[f].hasClass("entryRemove") && 0 === b--) {
        return f;
      }
    }
  };
  a.selectMenu = function(b, a) {
    if (b = this._convertSelector(b)) {
      "variable" == b && Entry.playground.checkVariables();
      "arduino" == b && this._generateHwCode();
      var c = this._categoryElems[b], e = this._selectedCategoryView, f = !1, g = this.workspace.board, h = g.view;
      e && e.removeClass("entrySelectedCategory");
      c != e || a ? e || (this.visible || (f = !0, h.addClass("foldOut"), Entry.playground.showTabs()), h.removeClass("folding"), this.visible = !0) : (h.addClass("folding"), this._selectedCategoryView = null, c.removeClass("entrySelectedCategory"), Entry.playground.hideTabs(), f = !0, this.visible = !1);
      f && Entry.bindAnimationCallbackOnce(h, function() {
        g.scroller.resizeScrollBar.call(g.scroller);
        h.removeClass("foldOut");
        Entry.windowResized.notify();
      });
      this.visible && (a = this._categoryCodes[b], this._selectedCategoryView = c, c.addClass("entrySelectedCategory"), a.constructor !== Entry.Code && (a = this._categoryCodes[b] = new Entry.Code(a)), this.changeCode(a));
      this.lastSelector = b;
    }
  };
  a._generateCategoryCodes = function(b) {
    this._categoryCodes = {};
    for (var a = 0;a < b.length;a++) {
      var c = b[a], e = [];
      c.blocks.forEach(function(b) {
        var a = Entry.block[b];
        if (a && a.def) {
          if (a.defs) {
            for (b = 0;b < a.defs.length;b++) {
              e.push([a.defs[b]]);
            }
          } else {
            e.push([a.def]);
          }
        } else {
          e.push([{type:b}]);
        }
      });
      c = c.category;
      this._categories.push(c);
      this._categoryCodes[c] = e;
    }
  };
  a.banClass = function(b, a) {
    0 > this._bannedClass.indexOf(b) && this._bannedClass.push(b);
    this.align(a);
  };
  a.unbanClass = function(b, a) {
    b = this._bannedClass.indexOf(b);
    -1 < b && this._bannedClass.splice(b, 1);
    this.align(a);
  };
  a.checkBanClass = function(b) {
    if (b) {
      b = b.isNotFor;
      for (var a in this._bannedClass) {
        if (b && -1 < b.indexOf(this._bannedClass[a])) {
          return !0;
        }
      }
      return !1;
    }
  };
  a._addControl = function(b) {
    var a = this;
    b.on("wheel", function() {
      a._mouseWheel.apply(a, arguments);
    });
  };
  a._mouseWheel = function(b) {
    b = b.originalEvent;
    b.preventDefault();
    var a = Entry.disposeEvent;
    a && a.notify(b);
    this._scroller.scroll(-b.wheelDeltaY || b.deltaY / 3);
  };
  a.dominate = function(b) {
    this.svgBlockGroup.appendChild(b.view.svgGroup);
  };
  a.reDraw = function() {
    this.selectMenu(this.lastSelector, !0);
  };
  a._handleDragBlock = function() {
    this._boardBlockView = null;
    this._scroller && this._scroller.setOpacity(0);
  };
  a._captureKeyEvent = function(b) {
    var a = b.keyCode, c = Entry.type;
    b.ctrlKey && "workspace" == c && 48 < a && 58 > a && (b.preventDefault(), this.selectMenu(a - 49));
  };
  a.setPatternRectFill = function(b) {
    this.patternRect.attr({fill:b});
  };
  a._clearCategory = function() {
    this._selectedCategoryView = null;
    this._categories = [];
    var b = this._categoryElems, a;
    for (a in b) {
      b[a].remove();
    }
    this._categoryElems = {};
    b = this._categoryCodes;
    for (a in b) {
      var c = b[a];
      c.constructor == Entry.Code && c.clear();
    }
    this._categoryCodes = null;
  };
  a.setCategoryData = function(b) {
    this._clearCategory();
    this._categoryData = b;
    this._generateCategoryView(b);
    this._generateCategoryCodes(b);
  };
  a._generateCategoryView = function(b) {
    if (b) {
      for (var a = this, c = 0;c < b.length;c++) {
        var e = b[c].category;
        (function(b, c) {
          b.text(Lang.Blocks[c.toUpperCase()]);
          a._categoryElems[c] = b;
          b.bindOnClick(function(b) {
            a.selectMenu(c);
          });
        })(Entry.Dom("li", {id:"entryCategory" + e, class:"entryCategoryElementWorkspace", parent:this._categoryCol}), e);
      }
    }
  };
  a.updateOffset = function() {
    this._offset = this.svgDom.offset();
  };
  a.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
  a._generateHwCode = function() {
    var b = this._categoryCodes.arduino;
    b instanceof Entry.Code && b.clear();
    for (var a = this._categoryData, c, b = a.length - 1;0 <= b;b--) {
      if ("arduino" === a[b].category) {
        c = a[b].blocks;
        break;
      }
    }
    a = [];
    for (b = 0;b < c.length;b++) {
      var e = c[b], f = Entry.block[e];
      if (!this.checkBanClass(f)) {
        if (f && f.def) {
          if (f.defs) {
            for (b = 0;b < f.defs.length;b++) {
              a.push([f.defs[b]]);
            }
          } else {
            a.push([f.def]);
          }
        } else {
          a.push([{type:e}]);
        }
      }
    }
    this._categoryCodes.arduino = a;
  };
})(Entry.BlockMenu.prototype);
Entry.BlockMenuScroller = function(a) {
  var b = this;
  this.board = a;
  this.board.changeEvent.attach(this, this._reset);
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hX = 0;
  this._visible = !0;
  this._opacity = -1;
  this.mouseHandler = function() {
    b.onMouseDown.apply(b, arguments);
  };
  this.createScrollBar();
  this.setOpacity(0);
  this._addControl();
  Entry.windowResized && Entry.windowResized.attach(this, this.resizeScrollBar);
};
Entry.BlockMenuScroller.RADIUS = 7;
(function(a) {
  a.createScrollBar = function() {
    this.svgGroup = this.board.svgGroup.elem("g", {class:"boardScrollbar"});
    this.vScrollbar = this.svgGroup.elem("rect", {rx:4, ry:4});
    this.resizeScrollBar();
  };
  a.resizeScrollBar = function() {
    this._updateRatio();
    if (this._visible && 0 !== this.vRatio) {
      var b = this.board.blockMenuContainer;
      this.vScrollbar.attr({width:9, height:b.height() / this.vRatio, x:b.width() - 9});
    }
  };
  a.updateScrollBar = function(b) {
    this.vY += b;
    this.vScrollbar.attr({y:this.vY});
  };
  a.scroll = function(b) {
    this.isVisible() && (b = this._adjustValue(b) - this.vY, 0 !== b && (this.board.code.moveBy(0, -b * this.vRatio), this.updateScrollBar(b)));
  };
  a._adjustValue = function(b) {
    var a = this.board.svgDom.height(), a = a - a / this.vRatio;
    b = this.vY + b;
    b = Math.max(0, b);
    return b = Math.min(a, b);
  };
  a.setVisible = function(b) {
    b != this.isVisible() && (this._visible = b, this.svgGroup.attr({display:!0 === b ? "block" : "none"}));
  };
  a.setOpacity = function(b) {
    this._opacity != b && (this.vScrollbar.attr({opacity:b}), this._opacity = b);
  };
  a.isVisible = function() {
    return this._visible;
  };
  a._updateRatio = function() {
    var b = this.board, a = b.svgBlockGroup.getBoundingClientRect(), c = b.blockMenuContainer.height(), b = b.offset();
    this.vRatio = a = (a.height + (a.top - b.top) + 10) / c;
    1 >= a ? this.setVisible(!1) : this.setVisible(!0);
  };
  a._reset = function() {
    this.vY = 0;
    this.vScrollbar.attr({y:this.vY});
    this.resizeScrollBar();
  };
  a.onMouseDown = function(b) {
    function a(b) {
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
      b = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
      var d = e.dragInstance;
      e.scroll(b.pageY - d.offsetY);
      d.set({offsetY:b.pageY});
    }
    function c(b) {
      $(document).unbind(".scroll");
      delete e.dragInstance;
    }
    var e = this;
    b.stopPropagation && b.stopPropagation();
    b.preventDefault && b.preventDefault();
    if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
      Entry.documentMousedown && Entry.documentMousedown.notify(b);
      var f;
      f = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
      var g = $(document);
      g.bind("mousemove.scroll", a);
      g.bind("mouseup.scroll", c);
      g.bind("touchmove.scroll", a);
      g.bind("touchend.scroll", c);
      e.dragInstance = new Entry.DragInstance({startY:f.pageY, offsetY:f.pageY});
    }
    b.stopPropagation();
  };
  a._addControl = function() {
    $(this.vScrollbar).bind("mousedown touchstart", this.mouseHandler);
  };
})(Entry.BlockMenuScroller.prototype);
Entry.BlockView = function(a, b, d) {
  Entry.Model(this, !1);
  this.block = a;
  this._board = b;
  this._observers = [];
  this.set(a);
  this.svgGroup = b.svgBlockGroup.elem("g");
  this._schema = Entry.block[a.type];
  this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
  var c = this._skeleton = Entry.skeleton[this._schema.skeleton];
  this._contents = [];
  this._statements = [];
  this.magnet = {};
  this._paramMap = {};
  c.magnets && c.magnets(this).next && (this.svgGroup.nextMagnet = this.block, this._nextGroup = this.svgGroup.elem("g"), this._observers.push(this.observe(this, "_updateMagnet", ["contentHeight"])));
  this.isInBlockMenu = this.getBoard() instanceof Entry.BlockMenu;
  var e = this;
  this.mouseHandler = function() {
    var b = e.block.events;
    b && b.mousedown && b.mousedown.forEach(function(b) {
      b(e);
    });
    e.onMouseDown.apply(e, arguments);
  };
  this._startRender(a, d);
  this._observers.push(this.block.observe(this, "_setMovable", ["movable"]));
  this._observers.push(this.block.observe(this, "_setReadOnly", ["movable"]));
  this._observers.push(this.block.observe(this, "_setCopyable", ["copyable"]));
  this._observers.push(this.block.observe(this, "_updateColor", ["deletable"], !1));
  this._observers.push(this.observe(this, "_updateBG", ["magneting"], !1));
  this._observers.push(this.observe(this, "_updateOpacity", ["visible"], !1));
  this._observers.push(this.observe(this, "_updateDisplay", ["display"], !1));
  this._observers.push(this.observe(this, "_updateShadow", ["shadow"]));
  this._observers.push(this.observe(this, "_updateMagnet", ["offsetY"]));
  this._observers.push(b.code.observe(this, "_setBoard", ["board"], !1));
  this.dragMode = Entry.DRAG_MODE_NONE;
  Entry.Utils.disableContextmenu(this.svgGroup.node);
  (b = a.events.viewAdd) && !this.isInBlockMenu && b.forEach(function(b) {
    Entry.Utils.isFunction(b) && b(a);
  });
  if ("function_general" == this.block.type) {
    debugger;
  }
};
Entry.BlockView.PARAM_SPACE = 5;
Entry.BlockView.DRAG_RADIUS = 5;
(function(a) {
  a.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, offsetX:0, offsetY:0, width:0, height:0, contentWidth:0, contentHeight:0, magneting:!1, visible:!0, animating:!1, shadow:!0, display:!0};
  a._startRender = function(b, a) {
    var c = this;
    b = this._skeleton;
    this.svgGroup.attr({class:"block"});
    var e = b.classes;
    e && 0 !== e.length && e.forEach(function(b) {
      c.svgGroup.addClass(b);
    });
    e = b.path(this);
    this.pathGroup = this.svgGroup.elem("g");
    this._updateMagnet();
    this._path = this.pathGroup.elem("path");
    this.getBoard().patternRect && ($(this._path).mouseenter(function(b) {
      c._mouseEnable && c._changeFill(!0);
    }), $(this._path).mouseleave(function(b) {
      c._mouseEnable && c._changeFill(!1);
    }));
    var f = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (f = Entry.Utils.colorLighten(f));
    this._fillColor = f;
    e = {d:e, fill:f, class:"blockPath"};
    if (this.magnet.next || this._skeleton.nextShadow) {
      f = this.getBoard().suffix, this.pathGroup.attr({filter:"url(#entryBlockShadowFilter_" + f + ")"});
    } else {
      if (this.magnet.string || this.magnet.boolean) {
        e.stroke = b.outerLine;
      }
    }
    b.outerLine && (e["stroke-width"] = "0.6");
    this._path.attr(e);
    this._moveTo(this.x, this.y, !1);
    this._startContentRender(a);
    !0 !== this._board.disableMouseEvent && this._addControl();
    this.bindPrev();
  };
  a._startContentRender = function(b) {
    b = void 0 === b ? Entry.Workspace.MODE_BOARD : b;
    this.contentSvgGroup && this.contentSvgGroup.remove();
    var a = this._schema;
    a.statements && a.statements.length && this.statementSvgGroup && this.statementSvgGroup.remove();
    this._contents = [];
    this.contentSvgGroup = this.svgGroup.elem("g");
    a.statements && a.statements.length && (this.statementSvgGroup = this.svgGroup.elem("g"));
    switch(b) {
      case Entry.Workspace.MODE_BOARD:
      ;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        for (var c = /(%\d)/mi, e = (a.template ? a.template : Lang.template[this.block.type]).split(c), f = a.params, g = 0;g < e.length;g++) {
          var h = e[g].trim();
          if (0 !== h.length) {
            if (c.test(h)) {
              var k = Number(h.split("%")[1]) - 1, h = f[k], h = new Entry["Field" + h.type](h, this, k, b, g);
              this._contents.push(h);
              this._paramMap[k] = h;
            } else {
              this._contents.push(new Entry.FieldText({text:h}, this));
            }
          }
        }
        if ((b = a.statements) && b.length) {
          for (g = 0;g < b.length;g++) {
            this._statements.push(new Entry.FieldStatement(b[g], this, g));
          }
        }
        break;
      case Entry.Workspace.MODE_VIMBOARD:
        if ("basic_button" === this._schema.skeleton) {
          this._startContentRender(Entry.Workspace.MODE_BOARD);
          return;
        }
        g = {text:this.getBoard().workspace.getCodeToText(this.block)};
        this.block._schema.vimModeFontColor && (g.color = this.block._schema.vimModeFontColor);
        this._contents.push(new Entry.FieldText(g, this));
    }
    this.alignContent(!1);
  };
  a._updateSchema = function() {
    this._startContentRender();
  };
  a.changeType = function(b) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this._schema = Entry.block[b];
    this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
    this._updateSchema();
  };
  a.alignContent = function(b) {
    !0 !== b && (b = !1);
    for (var a = 0, c = 0, e = 0, f = 0, g = 0, h = 0, k = 0;k < this._contents.length;k++) {
      var l = this._contents[k];
      l instanceof Entry.FieldLineBreak ? (this._alignStatement(b, f), l.align(f), f++, c = l.box.y, a = 8) : (l.align(a, c, b), k === this._contents.length - 1 || l instanceof Entry.FieldText && 0 == l._text.length || (a += Entry.BlockView.PARAM_SPACE));
      l = l.box;
      0 !== f ? h = Math.max(1E3 * Math.round(l.height), h) : e = Math.max(l.height, e);
      a += l.width;
      g = Math.max(g, a);
      this.set({contentWidth:g, contentHeight:e});
    }
    this.set({contentHeight:e + h});
    this._statements.length != f && this._alignStatement(b, f);
    b = this.getContentPos();
    this.contentSvgGroup.attr("transform", "translate(" + b.x + "," + b.y + ")");
    this.contentPos = b;
    this._render();
    this._updateMagnet();
  };
  a._alignStatement = function(b, a) {
    var c = this._skeleton.statementPos ? this._skeleton.statementPos(this) : [], e = this._statements[a];
    e && (a = c[a]) && e.align(a.x, a.y, b);
  };
  a._render = function() {
    this._renderPath();
    this.set(this._skeleton.box(this));
  };
  a._renderPath = function() {
    var b = this._skeleton.path(this);
    this._path.attr({d:b});
    this.set({animating:!1});
  };
  a._setPosition = function(b) {
    this.svgGroup.attr("transform", "translate(" + this.x + "," + this.y + ")");
  };
  a._toLocalCoordinate = function(b) {
    this._moveTo(0, 0, !1);
    b.appendChild(this.svgGroup);
  };
  a._toGlobalCoordinate = function(b) {
    b = this.getAbsoluteCoordinate(b);
    this._moveTo(b.x, b.y, !1);
    this.getBoard().svgBlockGroup.appendChild(this.svgGroup);
  };
  a._moveTo = function(b, a, c) {
    this.set({x:b, y:a});
    this.visible && this.display && this._setPosition(c);
  };
  a._moveBy = function(b, a, c) {
    return this._moveTo(this.x + b, this.y + a, c);
  };
  a._addControl = function() {
    var b = this;
    this._mouseEnable = !0;
    $(this.svgGroup).bind("mousedown.blockViewMousedown touchstart.blockViewMousedown", b.mouseHandler);
    var a = b.block.events;
    a && a.dblclick && $(this.svgGroup).dblclick(function() {
      a.dblclick.forEach(function(a) {
        a && a(b);
      });
    });
  };
  a.removeControl = function() {
    this._mouseEnable = !1;
    $(this.svgGroup).unbind(".blockViewMousedown");
  };
  a.onMouseDown = function(b) {
    function d(b) {
      b.stopPropagation();
      var d = e.workspace.getMode(), c;
      d === Entry.Workspace.MODE_VIMBOARD && a.vimBoardEvent(b, "dragOver");
      c = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
      var f = n.mouseDownCoordinate, f = Math.sqrt(Math.pow(c.pageX - f.x, 2) + Math.pow(c.pageY - f.y, 2));
      (n.dragMode == Entry.DRAG_MODE_DRAG || f > Entry.BlockView.DRAG_RADIUS) && n.movable && (n.isInBlockMenu ? e.cloneToGlobal(b) : (b = !1, n.dragMode != Entry.DRAG_MODE_DRAG && (n._toGlobalCoordinate(), n.dragMode = Entry.DRAG_MODE_DRAG, n.block.getThread().changeEvent.notify(), Entry.GlobalSvg.setView(n, d), b = !0), this.animating && this.set({animating:!1}), 0 === n.dragInstance.height && n.dragInstance.set({height:-1 + n.height}), d = n.dragInstance, n._moveBy(c.pageX - d.offsetX, c.pageY - 
      d.offsetY, !1), d.set({offsetX:c.pageX, offsetY:c.pageY}), Entry.GlobalSvg.position(), n.originPos || (n.originPos = {x:n.x, y:n.y}), b && e.generateCodeMagnetMap(), n._updateCloseBlock()));
    }
    function c(b) {
      $(document).unbind(".block");
      n.terminateDrag(b);
      e && e.set({dragBlock:null});
      n._changeFill(!1);
      Entry.GlobalSvg.remove();
      delete this.mouseDownCoordinate;
      delete n.dragInstance;
    }
    b.stopPropagation && b.stopPropagation();
    b.preventDefault && b.preventDefault();
    this._changeFill(!1);
    var e = this.getBoard();
    Entry.documentMousedown && Entry.documentMousedown.notify(b);
    if (!this.readOnly && !e.viewOnly) {
      e.setSelectedBlock(this);
      this.dominate();
      if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
        var f;
        f = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
        this.mouseDownCoordinate = {x:f.pageX, y:f.pageY};
        var g = $(document);
        g.bind("mousemove.block touchmove.block", d);
        g.bind("mouseup.block touchend.block", c);
        this.dragInstance = new Entry.DragInstance({startX:f.pageX, startY:f.pageY, offsetX:f.pageX, offsetY:f.pageY, height:0, mode:!0});
        e.set({dragBlock:this});
        this.addDragging();
        this.dragMode = Entry.DRAG_MODE_MOUSEDOWN;
      } else {
        if (Entry.Utils.isRightButton(b)) {
          var h = this, k = h.block;
          if (this.isInBlockMenu) {
            return;
          }
          f = [];
          var g = {text:Lang.Blocks.Duplication_option, enable:this.copyable, callback:function() {
            Entry.do("cloneBlock", k);
          }}, l = {text:Lang.Blocks.CONTEXT_COPY_option, enable:this.copyable, callback:function() {
            h.block.copyToClipboard();
          }}, m = {text:Lang.Blocks.Delete_Blocks, enable:k.isDeletable(), callback:function() {
            Entry.do("destroyBlock", h.block);
          }};
          f.push(g);
          f.push(l);
          f.push(m);
          Entry.ContextMenu.show(f);
        }
      }
      var n = this;
      e.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD && b && document.getElementsByClassName("CodeMirror")[0].dispatchEvent(Entry.Utils.createMouseEvent("dragStart", event));
    }
  };
  a.vimBoardEvent = function(b, a, c) {
    b && (b = Entry.Utils.createMouseEvent(a, b), c && (b.block = c), document.getElementsByClassName("CodeMirror")[0].dispatchEvent(b));
  };
  a.terminateDrag = function(b) {
    var a = this.getBoard(), c = this.dragMode, e = this.block, f = a.workspace.getMode();
    this.removeDragging();
    this.set({visible:!0});
    this.dragMode = Entry.DRAG_MODE_NONE;
    if (f === Entry.Workspace.MODE_VIMBOARD) {
      a instanceof Entry.BlockMenu ? (a.terminateDrag(), this.vimBoardEvent(b, "dragEnd", e)) : a.clear();
    } else {
      if (c === Entry.DRAG_MODE_DRAG) {
        (f = this.dragInstance && this.dragInstance.isNew) && (a.workspace.blockMenu.terminateDrag() || e._updatePos());
        var g = Entry.GlobalSvg, h = this.block.getPrevBlock(this.block);
        b = !1;
        switch(Entry.GlobalSvg.terminateDrag(this)) {
          case g.DONE:
            g = a.magnetedBlockView;
            g instanceof Entry.BlockView && (g = g.block);
            h && !g ? Entry.do("separateBlock", e) : h || g || f ? g ? ("next" === g.view.magneting ? (h = e.getLastBlock(), this.dragMode = c, a.separate(e), this.dragMode = Entry.DRAG_MODE_NONE, Entry.do("insertBlock", g, h).isPass(f), Entry.ConnectionRipple.setView(g.view).dispose()) : (Entry.do("insertBlock", e, g).isPass(f), b = !0), createjs.Sound.play("entryMagneting")) : Entry.do("moveBlock", e).isPass(f) : e.getThread().view.isGlobal() ? Entry.do("moveBlock", e) : Entry.do("separateBlock", 
            e);
            break;
          case g.RETURN:
            e = this.block;
            c = this.originPos;
            h ? (this.set({animating:!1}), createjs.Sound.play("entryMagneting"), this.bindPrev(h), e.insert(h)) : (f = e.getThread().view.getParent(), f instanceof Entry.Board ? this._moveTo(c.x, c.y, !1) : (createjs.Sound.play("entryMagneting"), Entry.do("insertBlock", e, f)));
            break;
          case g.REMOVE:
            createjs.Sound.play("entryDelete"), f ? this.block.destroy(!1, !0) : this.block.doDestroyBelow(!1);
        }
        a.setMagnetedBlock(null);
        b && Entry.ConnectionRipple.setView(e.view).dispose();
      }
    }
    this.destroyShadow();
    delete this.originPos;
    this.dominate();
  };
  a._updateCloseBlock = function() {
    var b = this.getBoard(), a;
    if (this._skeleton.magnets) {
      for (var c in this.magnet) {
        if (a = "next" === c ? this.getBoard().getNearestMagnet(this.x, this.y + this.getBelowHeight(), c) : this.getBoard().getNearestMagnet(this.x, this.y, c)) {
          return b.setMagnetedBlock(a.view, c);
        }
      }
      b.setMagnetedBlock(null);
    }
  };
  a.dominate = function() {
    this.block.getThread().view.dominate();
  };
  a.getSvgRoot = function() {
    for (var b = this.getBoard().svgBlockGroup, a = this.svgGroup;a.parentNode !== b;) {
      a = a.parentNode;
    }
    return a;
  };
  a.getBoard = function() {
    return this._board;
  };
  a._setBoard = function() {
    this._board = this._board.code.board;
  };
  a.destroy = function(b) {
    this._destroyObservers();
    var a = this.svgGroup;
    b ? $(a).fadeOut(100, function() {
      a.remove();
    }) : a.remove();
    this._contents.forEach(function(b) {
      b.constructor !== Entry.Block && b.destroy();
    });
    var c = this.block;
    (b = c.events.viewDestroy) && !this.isInBlockMenu && b.forEach(function(b) {
      Entry.Utils.isFunction(b) && b(c);
    });
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
  };
  a.getShadow = function() {
    this._shadow || (this._shadow = Entry.SVG.createElement(this.svgGroup.cloneNode(!0), {opacity:.5}), this.getBoard().svgGroup.appendChild(this._shadow));
    return this._shadow;
  };
  a.destroyShadow = function() {
    this._shadow && (this._shadow.remove(), delete this._shadow);
  };
  a._updateMagnet = function() {
    if (this._skeleton.magnets) {
      var b = this._skeleton.magnets(this);
      b.next && this._nextGroup.attr("transform", "translate(" + b.next.x + "," + b.next.y + ")");
      this.magnet = b;
      this.block.getThread().changeEvent.notify();
    }
  };
  a._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      var b = this.svgGroup;
      if (this.magnet.next) {
        if (b = this.magneting) {
          var a = this._board.dragBlock.getShadow(), c = this.getAbsoluteCoordinate(), e;
          if ("previous" === b) {
            e = this.magnet.next, e = "translate(" + (c.x + e.x) + "," + (c.y + e.y) + ")";
          } else {
            if ("next" === b) {
              e = this.magnet.previous;
              var f = this._board.dragBlock.getBelowHeight();
              e = "translate(" + (c.x + e.x) + "," + (c.y + e.y - f) + ")";
            }
          }
          $(a).attr({transform:e, display:"block"});
          this._clonedShadow = a;
          this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
          "previous" === b && (b = this._board.dragBlock.getBelowHeight() + this.offsetY, this.originalHeight = this.offsetY, this.set({offsetY:b}));
        } else {
          this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), b = this.originalHeight, void 0 !== b && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), this.set({offsetY:b}), delete this.originalHeight);
        }
        (b = this.block.thread.changeEvent) && b.notify();
      } else {
        this.magneting ? (b.attr({filter:"url(#entryBlockHighlightFilter_" + this.getBoard().suffix + ")"}), b.addClass("outputHighlight")) : (b.removeClass("outputHighlight"), b.removeAttr("filter"));
      }
    }
  };
  a.addDragging = function() {
    this.svgGroup.addClass("dragging");
  };
  a.removeDragging = function() {
    this.svgGroup.removeClass("dragging");
  };
  a.addSelected = function() {
    this.svgGroup.addClass("selected");
  };
  a.removeSelected = function() {
    this.svgGroup.removeClass("selected");
  };
  a.getSkeleton = function() {
    return this._skeleton;
  };
  a.getContentPos = function() {
    return this._skeleton.contentPos(this);
  };
  a.renderText = function() {
    this._startContentRender(Entry.Workspace.MODE_VIMBOARD);
  };
  a.renderBlock = function() {
    this._startContentRender(Entry.Workspace.MODE_BOARD);
  };
  a._updateOpacity = function() {
    this.svgGroup.attr({opacity:!1 === this.visible ? 0 : 1});
    this.visible && this._setPosition();
  };
  a._updateShadow = function() {
    this.shadow && Entry.Utils.colorDarken(this._schema.color, .7);
  };
  a._setMovable = function() {
    this.movable = null !== this.block.isMovable() ? this.block.isMovable() : void 0 !== this._skeleton.movable ? this._skeleton.movable : !0;
  };
  a._setReadOnly = function() {
    this.readOnly = null !== this.block.isReadOnly() ? this.block.isReadOnly() : void 0 !== this._skeleton.readOnly ? this._skeleton.readOnly : !1;
  };
  a._setCopyable = function() {
    this.copyable = null !== this.block.isCopyable() ? this.block.isCopyable() : void 0 !== this._skeleton.copyable ? this._skeleton.copyable : !0;
  };
  a.bumpAway = function(b, a) {
    var c = this;
    b = b || 15;
    a ? window.setTimeout(function() {
      c._moveBy(b, b, !1);
    }, a) : c._moveBy(b, b, !1);
  };
  a.bindPrev = function(b) {
    if (b) {
      if (this._toLocalCoordinate(b.view._nextGroup), (b = b.getNextBlock()) && b !== this.block) {
        var a = this.block.getLastBlock();
        a.view.magnet.next ? b.view._toLocalCoordinate(a.view._nextGroup) : (b.view._toGlobalCoordinate(), b.separate(), b.view.bumpAway(null, 100));
      }
    } else {
      if (b = this.block.getPrevBlock()) {
        this._toLocalCoordinate(b.view._nextGroup), (b = this.block.getNextBlock()) && b.view && b.view._toLocalCoordinate(this._nextGroup);
      }
    }
  };
  a.getAbsoluteCoordinate = function(b) {
    b = void 0 !== b ? b : this.dragMode;
    if (b === Entry.DRAG_MODE_DRAG) {
      return {x:this.x, y:this.y};
    }
    b = this.block.getThread().view.requestAbsoluteCoordinate(this);
    b.x += this.x;
    b.y += this.y;
    return b;
  };
  a.getBelowHeight = function() {
    return this.block.getThread().view.requestPartHeight(this);
  };
  a._updateDisplay = function() {
    this.svgGroup.attr({display:!1 === this.display ? "none" : "block"});
    this.display && this._setPosition();
  };
  a._updateColor = function() {
    var b = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (b = Entry.Utils.colorLighten(b));
    this._fillColor = b;
    this._path.attr({fill:b});
    this._updateContents();
  };
  a._updateContents = function() {
    for (var b = 0;b < this._contents.length;b++) {
      this._contents[b].renderStart();
    }
    this.alignContent(!1);
  };
  a._destroyObservers = function() {
    for (var b = this._observers;b.length;) {
      b.pop().destroy();
    }
  };
  a._changeFill = function(b) {
    var a = this.getBoard();
    if (a.patternRect && !a.dragBlock) {
      var c = this._path, e = this._fillColor;
      b && (a = this.getBoard(), a.setPatternRectFill(e), e = "url(#blockHoverPattern_" + this.getBoard().suffix + ")");
      c.attr({fill:e});
    }
  };
  a.addActivated = function() {
    this.svgGroup.addClass("activated");
  };
  a.removeActivated = function() {
    this.svgGroup.removeClass("activated");
  };
  a.reDraw = function() {
    if (this.visible) {
      var b = this.block;
      requestAnimationFrame(this._updateContents.bind(this));
      var a = b.params;
      if (a) {
        for (var c = 0;c < a.length;c++) {
          var e = a[c];
          e instanceof Entry.Block && e.view.reDraw();
        }
      }
      if (b = b.statements) {
        for (c = 0;c < b.length;c++) {
          b[c].view.reDraw();
        }
      }
    }
  };
  a.getParam = function(b) {
    return this._paramMap[b];
  };
})(Entry.BlockView.prototype);
Entry.Field = function() {
};
(function(a) {
  a.TEXT_LIMIT_LENGTH = 20;
  a.destroy = function() {
    this.destroyOption();
  };
  a.command = function() {
    this._startValue && (this._startValue === this.getValue() || this._blockView.isInBlockMenu || Entry.do("setFieldValue", this._block, this, this.pointer(), this._startValue, this.getValue()));
    delete this._startValue;
  };
  a.destroyOption = function() {
    this.documentDownEvent && (Entry.documentMousedown.detach(this.documentDownEvent), delete this.documentDownEvent);
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this.command();
  };
  a._attachDisposeEvent = function(b) {
    var a = this;
    a.disposeEvent = Entry.disposeEvent.attach(a, b || function() {
      a.destroyOption();
    });
  };
  a.align = function(b, a, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (b = this._position.x), this._position.y && (a = this._position.y));
    var f = "translate(" + b + "," + a + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:b, y:a});
  };
  a.getAbsolutePosFromBoard = function() {
    var b = this._block.view, a = b.getContentPos(), b = b.getAbsoluteCoordinate();
    return {x:b.x + this.box.x + a.x, y:b.y + this.box.y + a.y};
  };
  a.getAbsolutePosFromDocument = function() {
    var b = this._block.view, a = b.getContentPos(), c = b.getAbsoluteCoordinate(), b = b.getBoard().svgDom.offset();
    return {x:c.x + this.box.x + a.x + b.left, y:c.y + this.box.y + a.y + b.top};
  };
  a.getRelativePos = function() {
    var b = this._block.view.getContentPos(), a = this.box;
    return {x:a.x + b.x, y:a.y + b.y};
  };
  a.truncate = function() {
    var b = String(this.getValue()), a = this.TEXT_LIMIT_LENGTH, c = b.substring(0, a);
    b.length > a && (c += "...");
    return c;
  };
  a.appendSvgOptionGroup = function() {
    return this._block.view.getBoard().svgGroup.elem("g");
  };
  a.getValue = function() {
    return this._block.params[this._index];
  };
  a.setValue = function(b, a) {
    this.value != b && (this.value = b, this._block.params[this._index] = b, a && this._blockView.reDraw());
  };
  a._isEditable = function() {
    if (this._block.view.dragMode == Entry.DRAG_MODE_DRAG) {
      return !1;
    }
    var b = this._block.view, a = b.getBoard();
    if (!0 === a.disableMouseEvent) {
      return !1;
    }
    var c = a.workspace.selectedBlockView;
    if (!c || a != c.getBoard()) {
      return !1;
    }
    a = b.getSvgRoot();
    return a == c.svgGroup || $(a).has($(b.svgGroup));
  };
  a._selectBlockView = function() {
    var b = this._block.view;
    b.getBoard().setSelectedBlock(b);
  };
  a._bindRenderOptions = function() {
    var b = this;
    $(this.svgGroup).bind("mouseup touchend", function(a) {
      b._isEditable() && (b.destroyOption(), b._startValue = b.getValue(), b.renderOptions());
    });
  };
  a.pointer = function(b) {
    b = b || [];
    b.unshift(this._index);
    b.unshift(Entry.PARAM);
    return this._block.pointer(b);
  };
})(Entry.Field.prototype);
Entry.FieldBlock = function(a, b, d, c, e) {
  Entry.Model(this, !1);
  this._blockView = b;
  this._block = b.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = d;
  this.contentIndex = e;
  this._content = a;
  this.acceptType = a.accept;
  this._restoreCurrent = a.restore;
  this.view = this;
  this.svgGroup = null;
  this._position = a.position;
  this.box.observe(b, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(b.getBoard(), c);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldBlock);
(function(a) {
  a.schema = {magneting:!1};
  a.renderStart = function(b, a) {
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var c = this.getValue();
    c && !c.view && (c.setThread(this), c.createView(b, a), c.getThread().view.setParent(this));
    this.updateValueBlock(c);
    this._blockView.getBoard().constructor !== Entry.Board && this._valueBlock.view.removeControl();
  };
  a.align = function(b, a, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (b = this._position.x), this._position.y && (a = this._position.y));
    var f = this._valueBlock;
    f && (a = -.5 * f.view.height);
    f = "translate(" + b + "," + a + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:b, y:a});
  };
  a.calcWH = function() {
    var b = this._valueBlock;
    b ? (b = b.view, this.box.set({width:b.width, height:b.height})) : this.box.set({width:15, height:20});
  };
  a.calcHeight = a.calcWH;
  a.destroy = function() {
  };
  a.inspectBlock = function() {
    var b = null;
    if (this._originBlock) {
      b = this._originBlock.type, delete this._originBlock;
    } else {
      switch(this.acceptType) {
        case "boolean":
          b = "True";
          break;
        case "string":
          b = "text";
          break;
        case "param":
          b = "function_field_label";
      }
    }
    return this._createBlockByType(b);
  };
  a._setValueBlock = function(b) {
    this._restoreCurrent && (this._originBlock = this._valueBlock);
    b || (b = this.inspectBlock());
    this._valueBlock = b;
    this.setValue(b);
    b.setThread(this);
    b.getThread().view.setParent(this);
    return this._valueBlock;
  };
  a.getValueBlock = function() {
    return this._valueBlock;
  };
  a.updateValueBlock = function(b) {
    b instanceof Entry.Block || (b = void 0);
    this._destroyObservers();
    b = this._setValueBlock(b).view;
    b.bindPrev(this);
    this._blockView.alignContent();
    this._posObserver = b.observe(this, "updateValueBlock", ["x", "y"], !1);
    this._sizeObserver = b.observe(this, "calcWH", ["width", "height"]);
    b = this._blockView.getBoard();
    b.constructor === Entry.Board && b.generateCodeMagnetMap();
  };
  a._destroyObservers = function() {
    this._sizeObserver && this._sizeObserver.destroy();
    this._posObserver && this._posObserver.destroy();
  };
  a.getPrevBlock = function(b) {
    return this._valueBlock === b ? this : null;
  };
  a.getNextBlock = function() {
    return null;
  };
  a.requestAbsoluteCoordinate = function(b) {
    b = this._blockView;
    var a = b.contentPos;
    b = b.getAbsoluteCoordinate();
    b.x += this.box.x + a.x;
    b.y += this.box.y + a.y;
    return b;
  };
  a.dominate = function() {
    this._blockView.dominate();
  };
  a.isGlobal = function() {
    return !1;
  };
  a.separate = function(b) {
    this.getCode().createThread([b]);
    this.calcWH();
    this.changeEvent.notify();
  };
  a.getCode = function() {
    return this._block.thread.getCode();
  };
  a.cut = function(b) {
    return this._valueBlock === b ? [b] : null;
  };
  a.replace = function(b) {
    "string" === typeof b && (b = this._createBlockByType(b));
    var a = this._valueBlock;
    Entry.block[a.type].isPrimitive ? (a.doNotSplice = !0, a.destroy()) : "param" === this.acceptType ? (this._destroyObservers(), a.view._toGlobalCoordinate(), b.getTerminateOutputBlock().view._contents[1].replace(a)) : (this._destroyObservers(), a.view._toGlobalCoordinate(), this.separate(a), a.view.bumpAway(30, 150));
    this.updateValueBlock(b);
    b.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
    this.changeEvent.notify();
  };
  a.setParent = function(b) {
    this._parent = b;
  };
  a.getParent = function() {
    return this._parent;
  };
  a._createBlockByType = function(b) {
    this._block.getThread();
    var a = this._blockView.getBoard();
    b = new Entry.Block({type:b}, this);
    var c = a.workspace, e;
    c && (e = c.getMode());
    b.createView(a, e);
    return b;
  };
  a.spliceBlock = function() {
    this.updateValueBlock();
  };
  a._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m 8,12 l -4,0 -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2 l 4,0 z", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0,12)"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  a.getThread = function() {
    return this;
  };
  a.pointer = function(b) {
    b.unshift(this._index);
    b.unshift(Entry.PARAM);
    return this._block.pointer(b);
  };
})(Entry.FieldBlock.prototype);
Entry.Scroller = function(a, b, d) {
  this._horizontal = void 0 === b ? !0 : b;
  this._vertical = void 0 === d ? !0 : d;
  this.board = a;
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hRatio = this.hX = this.hWidth = 0;
  this._visible = !0;
  this._opacity = -1;
  this.createScrollBar();
  this.setOpacity(0);
  this._bindEvent();
};
Entry.Scroller.RADIUS = 7;
(function(a) {
  a.createScrollBar = function() {
    var b = Entry.Scroller.RADIUS, a = this;
    this.svgGroup = this.board.svg.elem("g").attr({class:"boardScrollbar"});
    this._horizontal && (this.hScrollbar = this.svgGroup.elem("rect", {height:2 * b, rx:b, ry:b}), this.hScrollbar.mousedown = function(b) {
      function e(b) {
        b.stopPropagation();
        b.preventDefault();
        b.originalEvent.touches && (b = b.originalEvent.touches[0]);
        var c = a.dragInstance;
        a.scroll((b.pageX - c.offsetX) / a.hRatio, 0);
        c.set({offsetX:b.pageX, offsetY:b.pageY});
      }
      function f(b) {
        $(document).unbind(".scroll");
        delete a.dragInstance;
      }
      if (0 === b.button || b instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(b);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        a.dragInstance = new Entry.DragInstance({startX:b.pageX, startY:b.pageY, offsetX:b.pageX, offsetY:b.pageY});
      }
      b.stopPropagation();
    });
    this._vertical && (this.vScrollbar = this.svgGroup.elem("rect", {width:2 * b, rx:b, ry:b}), this.vScrollbar.mousedown = function(b) {
      function e(b) {
        b.stopPropagation();
        b.preventDefault();
        b.originalEvent.touches && (b = b.originalEvent.touches[0]);
        var c = a.dragInstance;
        a.scroll(0, (b.pageY - c.offsetY) / a.vRatio);
        c.set({offsetX:b.pageX, offsetY:b.pageY});
      }
      function f(b) {
        $(document).unbind(".scroll");
        delete a.dragInstance;
      }
      if (0 === b.button || b instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(b);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        a.dragInstance = new Entry.DragInstance({startX:b.pageX, startY:b.pageY, offsetX:b.pageX, offsetY:b.pageY});
      }
      b.stopPropagation();
    });
  };
  a.updateScrollBar = function(b, a) {
    this._horizontal && (this.hX += b * this.hRatio, this.hScrollbar.attr({x:this.hX}));
    this._vertical && (this.vY += a * this.vRatio, this.vScrollbar.attr({y:this.vY}));
  };
  a.scroll = function(b, a) {
    if (this.board.code) {
      var c = this.board.svgBlockGroup.getBoundingClientRect(), e = this.board.svgDom, f = c.left - this.board.offset().left, g = c.top - this.board.offset().top, h = c.height;
      b = Math.max(-c.width + Entry.BOARD_PADDING - f, b);
      a = Math.max(-h + Entry.BOARD_PADDING - g, a);
      b = Math.min(e.width() - Entry.BOARD_PADDING - f, b);
      a = Math.min(e.height() - Entry.BOARD_PADDING - g, a);
      Entry.do("scrollBoard", b, a).isPass();
    }
  };
  a._scroll = function(b, a) {
    this.board.code.moveBy(b, a);
    this.updateScrollBar(b, a);
  };
  a.setVisible = function(b) {
    b != this.isVisible() && (this._visible = b, this.svgGroup.attr({display:!0 === b ? "block" : "none"}));
  };
  a.isVisible = function() {
    return this._visible;
  };
  a.setOpacity = function(b) {
    this._opacity != b && (this.hScrollbar.attr({opacity:b}), this.vScrollbar.attr({opacity:b}), this._opacity = b);
  };
  a.resizeScrollBar = function() {
    if (this._visible) {
      var b = this.board, a = b.svgBlockGroup.getBoundingClientRect(), c = b.svgDom, e = c.width(), c = c.height(), f = a.left - b.offset().left, b = a.top - b.offset().top, g = a.width, a = a.height;
      if (this._horizontal) {
        var h = -g + Entry.BOARD_PADDING, k = e - Entry.BOARD_PADDING, g = (e + 2 * Entry.Scroller.RADIUS) * g / (k - h + g);
        isNaN(g) && (g = 0);
        this.hX = (f - h) / (k - h) * (e - g - 2 * Entry.Scroller.RADIUS);
        this.hScrollbar.attr({width:g, x:this.hX, y:c - 2 * Entry.Scroller.RADIUS});
        this.hRatio = (e - g - 2 * Entry.Scroller.RADIUS) / (k - h);
      }
      this._vertical && (f = -a + Entry.BOARD_PADDING, g = c - Entry.BOARD_PADDING, a = (c + 2 * Entry.Scroller.RADIUS) * a / (g - f + a), this.vY = (b - f) / (g - f) * (c - a - 2 * Entry.Scroller.RADIUS), this.vScrollbar.attr({height:a, y:this.vY, x:e - 2 * Entry.Scroller.RADIUS}), this.vRatio = (c - a - 2 * Entry.Scroller.RADIUS) / (g - f));
    }
  };
  a._bindEvent = function() {
    var b = _.debounce(this.resizeScrollBar, 200);
    this.board.changeEvent.attach(this, b);
    Entry.windowResized && Entry.windowResized.attach(this, b);
  };
})(Entry.Scroller.prototype);
Entry.Board = function(a) {
  Entry.Model(this, !1);
  this.changeEvent = new Entry.Event(this);
  this.createView(a);
  this.updateOffset();
  this.scroller = new Entry.Scroller(this, !0, !0);
  this._magnetMap = {};
  Entry.ANIMATION_DURATION = 200;
  Entry.BOARD_PADDING = 100;
  this._initContextOptions();
  Entry.Utils.disableContextmenu(this.svgDom);
  this._addControl();
  this._bindEvent();
};
Entry.Board.OPTION_PASTE = 0;
Entry.Board.OPTION_ALIGN = 1;
Entry.Board.OPTION_CLEAR = 2;
(function(a) {
  a.schema = {code:null, dragBlock:null, magnetedBlockView:null, selectedBlockView:null};
  a.createView = function(b) {
    var a = b.dom, a = "string" === typeof a ? $("#" + a) : $(a);
    if ("DIV" !== a.prop("tagName")) {
      return console.error("Dom is not div element");
    }
    this.view = a;
    this._svgId = "play" + (new Date).getTime();
    this.workspace = b.workspace;
    this._activatedBlockView = null;
    this.wrapper = Entry.Dom("div", {parent:a, class:"entryBoardWrapper"});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="entryBoard" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.wrapper});
    this.visible = !0;
    var c = this;
    this.svg = Entry.SVG(this._svgId);
    $(window).scroll(function() {
      c.updateOffset();
    });
    this.svgGroup = this.svg.elem("g");
    this.svgThreadGroup = this.svgGroup.elem("g");
    this.svgThreadGroup.board = this;
    this.svgBlockGroup = this.svgGroup.elem("g");
    this.svgBlockGroup.board = this;
    b.isOverlay ? (this.wrapper.addClass("entryOverlayBoard"), this.generateButtons(), this.suffix = "overlayBoard") : this.suffix = "board";
    Entry.Utils.addFilters(this.svg, this.suffix);
    this.patternRect = Entry.Utils.addBlockPattern(this.svg, this.suffix);
  };
  a.changeCode = function(b) {
    this.code && this.codeListener && this.code.changeEvent.detach(this.codeListener);
    this.set({code:b});
    var a = this;
    b && (this.codeListener = this.code.changeEvent.attach(this, function() {
      a.changeEvent.notify();
    }), b.createView(this));
    this.scroller.resizeScrollBar();
  };
  a.bindCodeView = function(b) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = b.svgBlockGroup;
    this.svgThreadGroup = b.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  a.setMagnetedBlock = function(b, a) {
    if (this.magnetedBlockView) {
      if (this.magnetedBlockView === b) {
        return;
      }
      this.magnetedBlockView.set({magneting:!1});
    }
    this.set({magnetedBlockView:b});
    b && (b.set({magneting:a}), b.dominate());
  };
  a.getCode = function() {
    return this.code;
  };
  a.findById = function(b) {
    return this.code.findById(b);
  };
  a._addControl = function() {
    var b = this.svgDom, a = this;
    b.mousedown(function() {
      a.onMouseDown.apply(a, arguments);
    });
    b.bind("touchstart", function() {
      a.onMouseDown.apply(a, arguments);
    });
    b.on("wheel", function() {
      a.mouseWheel.apply(a, arguments);
    });
    var c = a.scroller;
    c && (b.mouseenter(function(b) {
      c.setOpacity(1);
    }), b.mouseleave(function(b) {
      c.setOpacity(0);
    }));
  };
  a.onMouseDown = function(b) {
    function a(b) {
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
      b = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
      var d = f.dragInstance;
      f.scroller.scroll(b.pageX - d.offsetX, b.pageY - d.offsetY);
      d.set({offsetX:b.pageX, offsetY:b.pageY});
    }
    function c(b) {
      $(document).unbind(".entryBoard");
      delete f.dragInstance;
    }
    if (this.workspace.getMode() != Entry.Workspace.MODE_VIMBOARD) {
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
      if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
        b = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
        Entry.documentMousedown && Entry.documentMousedown.notify(b);
        var e = $(document);
        e.bind("mousemove.entryBoard", a);
        e.bind("mouseup.entryBoard", c);
        e.bind("touchmove.entryBoard", a);
        e.bind("touchend.entryBoard", c);
        this.dragInstance = new Entry.DragInstance({startX:b.pageX, startY:b.pageY, offsetX:b.pageX, offsetY:b.pageY});
      } else {
        if (Entry.Utils.isRightButton(b)) {
          if (!this.visible) {
            return;
          }
          b = [];
          this._contextOptions[Entry.Board.OPTION_PASTE].option.enable = !!Entry.clipboard;
          for (e = 0;e < this._contextOptions.length;e++) {
            this._contextOptions[e].activated && b.push(this._contextOptions[e].option);
          }
          Entry.ContextMenu.show(b);
        }
      }
      var f = this;
    }
  };
  a.mouseWheel = function(b) {
    b = b.originalEvent;
    b.preventDefault();
    var a = Entry.disposeEvent;
    a && a.notify(b);
    this.scroller.scroll(b.wheelDeltaX || -b.deltaX, b.wheelDeltaY || -b.deltaY);
  };
  a.setSelectedBlock = function(b) {
    var a = this.selectedBlockView;
    a && a.removeSelected();
    b instanceof Entry.BlockView ? b.addSelected() : b = null;
    this.set({selectedBlockView:b});
  };
  a._keyboardControl = function(b) {
    var a = this.selectedBlockView;
    a && 46 == b.keyCode && a.block && (Entry.do("destroyBlock", a.block), this.set({selectedBlockView:null}));
  };
  a.hide = function() {
    this.wrapper.addClass("entryRemove");
    this.visible = !1;
  };
  a.show = function() {
    this.wrapper.removeClass("entryRemove");
    this.visible = !0;
  };
  a.alignThreads = function() {
    for (var b = this.svgDom.height(), a = this.code.getThreads(), c = 15, e = 0, b = b - 30, f = 50, g = 0;g < a.length;g++) {
      var h = a[g].getFirstBlock();
      if (h) {
        var h = h.view, k = h.svgGroup.getBBox(), l = c + 15;
        l > b && (f = f + e + 10, e = 0, c = 15);
        e = Math.max(e, k.width);
        l = c + 15;
        h._moveTo(f, l, !1);
        c = c + k.height + 15;
      }
    }
    this.scroller.resizeScrollBar();
  };
  a.clear = function() {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
  };
  a.updateOffset = function() {
    this._offset = this.svg.getBoundingClientRect();
    var b = $(window), a = b.scrollTop(), b = b.scrollLeft(), c = this._offset;
    this.relativeOffset = {top:c.top - a, left:c.left - b};
    this.btnWrapper && this.btnWrapper.attr({transform:"translate(" + (c.width / 2 - 65) + "," + (c.height - 200) + ")"});
  };
  a.generateButtons = function() {
    var b = this, a = this.svgGroup.elem("g");
    this.btnWrapper = a;
    var c = a.elem("text", {x:27, y:33, class:"entryFunctionButtonText"});
    c.textContent = Lang.Buttons.save;
    var e = a.elem("text", {x:102.5, y:33, class:"entryFunctionButtonText"});
    e.textContent = Lang.Buttons.cancel;
    var f = a.elem("circle", {cx:27.5, cy:27.5, r:27.5, class:"entryFunctionButton"}), a = a.elem("circle", {cx:102.5, cy:27.5, r:27.5, class:"entryFunctionButton"});
    $(f).bind("mousedown touchstart", function() {
      b.save();
    });
    $(c).bind("mousedown touchstart", function() {
      b.save();
    });
    $(a).bind("mousedown touchstart", function() {
      b.cancelEdit();
    });
    $(e).bind("mousedown touchstart", function() {
      b.cancelEdit();
    });
  };
  a.cancelEdit = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "cancelEdit");
  };
  a.save = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "save");
  };
  a.generateCodeMagnetMap = function() {
    var b = this.code;
    if (b && this.dragBlock) {
      for (var a in this.dragBlock.magnet) {
        var c = this._getCodeBlocks(b, a);
        c.sort(function(b, a) {
          return b.point - a.point;
        });
        c.unshift({point:-Number.MAX_VALUE, blocks:[]});
        for (var e = 1;e < c.length;e++) {
          var f = c[e], g = f, h = f.startBlock;
          if (h) {
            for (var k = f.endPoint, l = e;k > g.point && (g.blocks.push(h), l++, g = c[l], g);) {
            }
            delete f.startBlock;
          }
          f.endPoint = Number.MAX_VALUE;
          c[e - 1].endPoint = f.point;
        }
        this._magnetMap[a] = c;
      }
    }
  };
  a._getCodeBlocks = function(b, a) {
    b = b.getThreads();
    var c = [], e;
    switch(a) {
      case "previous":
        e = this._getNextMagnets;
        break;
      case "next":
        e = this._getPreviousMagnets;
        break;
      case "string":
        e = this._getFieldMagnets;
        break;
      case "boolean":
        e = this._getFieldMagnets;
        break;
      case "param":
        e = this._getOutputMagnets;
        break;
      default:
        return [];
    }
    for (var f = 0;f < b.length;f++) {
      var g = b[f], c = c.concat(e.call(this, g, g.view.zIndex, null, a))
    }
    return c;
  };
  a._getNextMagnets = function(b, a, c, e) {
    var f = b.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var m = f[l], n = m.view;
      n.zIndex = a;
      if (n.dragInstance) {
        break;
      }
      c += n.y;
      k += n.x;
      b = c + 1;
      n.magnet.next && (b += n.height, h.push({point:c, endPoint:b, startBlock:m, blocks:[]}), h.push({point:b, blocks:[]}), n.absX = k);
      m.statements && (a += .01);
      for (var q = 0;q < m.statements.length;q++) {
        b = m.statements[q];
        var r = m.view._statements[q];
        r.zIndex = a;
        r.absX = k + r.x;
        h.push({point:r.y + c - 30, endPoint:r.y + c, startBlock:r, blocks:[]});
        h.push({point:r.y + c + r.height, blocks:[]});
        a += .01;
        g = g.concat(this._getNextMagnets(b, a, {x:r.x + k, y:r.y + c}, e));
      }
      n.magnet.next && (c += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  a._getPreviousMagnets = function(b, a, c, e) {
    var f = b.getBlocks();
    b = [];
    c || (c = {x:0, y:0});
    e = c.x;
    c = c.y;
    var f = f[0], g = f.view;
    g.zIndex = a;
    if (g.dragInstance) {
      return [];
    }
    c += g.y - 15;
    e += g.x;
    return g.magnet.previous ? (a = c + 1 + g.height, b.push({point:c, endPoint:a, startBlock:f, blocks:[]}), b.push({point:a, blocks:[]}), g.absX = e, b) : [];
  };
  a._getFieldMagnets = function(b, a, c, e) {
    var f = b.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var m = f[l], n = m.view;
      if (n.dragInstance) {
        break;
      }
      n.zIndex = a;
      c += n.y;
      k += n.x;
      h = h.concat(this._getFieldBlockMetaData(n, k, c, a, e));
      m.statements && (a += .01);
      for (var q = 0;q < m.statements.length;q++) {
        b = m.statements[q];
        var r = m.view._statements[q], g = g.concat(this._getFieldMagnets(b, a, {x:r.x + k, y:r.y + c}, e));
      }
      n.magnet.next && (c += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  a._getFieldBlockMetaData = function(b, a, c, e, f) {
    var g = b._contents, h = [];
    c += b.contentPos.y;
    for (var k = 0;k < g.length;k++) {
      var l = g[k];
      if (l instanceof Entry.FieldBlock) {
        var m = l._valueBlock;
        if (!m.view.dragInstance && (l.acceptType === f || "boolean" === l.acceptType)) {
          var n = a + l.box.x, q = c + l.box.y + b.contentHeight % 1E3 * -.5, r = c + l.box.y + l.box.height;
          l.acceptType === f && (h.push({point:q, endPoint:r, startBlock:m, blocks:[]}), h.push({point:r, blocks:[]}));
          l = m.view;
          l.absX = n;
          l.zIndex = e;
          h = h.concat(this._getFieldBlockMetaData(l, n + l.contentPos.x, q + l.contentPos.y, e + .01, f));
        }
      }
    }
    return h;
  };
  a._getOutputMagnets = function(b, a, c, e) {
    var f = b.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var m = f[l], n = m.view;
      if (n.dragInstance) {
        break;
      }
      n.zIndex = a;
      c += n.y;
      k += n.x;
      h = h.concat(this._getOutputMetaData(n, k, c, a, e));
      m.statements && (a += .01);
      for (var q = 0;q < m.statements.length;q++) {
        b = m.statements[q];
        var r = m.view._statements[q], g = g.concat(this._getOutputMagnets(b, a, {x:r.x + k, y:r.y + c}, e));
      }
      n.magnet.next && (c += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  a._getOutputMetaData = function(b, a, c, e, f) {
    var g = b._contents, h = [];
    a += b.contentPos.x;
    c += b.contentPos.y;
    for (b = 0;b < g.length;b++) {
      var k = g[b], l = a + k.box.x, m = c - 24, n = c;
      k instanceof Entry.FieldBlock ? (k.acceptType === f && (h.push({point:m, endPoint:n, startBlock:k, blocks:[]}), h.push({point:n, blocks:[]}), k.absX = l, k.zIndex = e, k.width = 20), (m = k._valueBlock) && (h = h.concat(this._getOutputMetaData(m.view, l, c + k.box.y, e + .01, f)))) : k instanceof Entry.FieldOutput && k.acceptType === f && (h.push({point:m, endPoint:n, startBlock:k, blocks:[]}), h.push({point:n, blocks:[]}), k.absX = l, k.zIndex = e, k.width = 20, (m = k._valueBlock) && (m.view.dragInstance || 
      (h = h.concat(this._getOutputMetaData(m.view, a + k.box.x, c + k.box.y, e + .01, f)))));
    }
    return h;
  };
  a.getNearestMagnet = function(b, a, c) {
    var e = this._magnetMap[c];
    if (e && 0 !== e.length) {
      var f = 0, g = e.length - 1, h, k = null, l = "previous" === c ? a - 15 : a;
      for (a = -1 < ["previous", "next"].indexOf(c) ? 20 : 0;f <= g;) {
        if (h = (f + g) / 2 | 0, c = e[h], l < c.point) {
          g = h - 1;
        } else {
          if (l > c.endPoint) {
            f = h + 1;
          } else {
            e = c.blocks;
            for (f = 0;f < e.length;f++) {
              if (g = e[f].view, g.absX - a < b && b < g.absX + g.width && (g = c.blocks[f], !k || k.view.zIndex < g.view.zIndex)) {
                k = c.blocks[f];
              }
            }
            return k;
          }
        }
      }
      return null;
    }
  };
  a.dominate = function(b) {
    b && (b = b.getFirstBlock()) && (this.svgBlockGroup.appendChild(b.view.svgGroup), this.code.dominate(b.thread));
  };
  a.setPatternRectFill = function(b) {
    this.patternRect.attr({fill:b});
  };
  a._removeActivated = function() {
    this._activatedBlockView && (this._activatedBlockView.removeActivated(), this._activatedBlockView = null);
  };
  a.activateBlock = function(b) {
    b = b.view;
    var a = b.getAbsoluteCoordinate(), c = this.svgDom, e = a.x, a = a.y, e = c.width() / 2 - e, c = c.height() / 2 - a - 100;
    this.scroller.scroll(e, c);
    b.addActivated();
    this._activatedBlockView = b;
  };
  a.reDraw = function() {
    this.code.view.reDraw();
  };
  a.separate = function(b, a) {
    "string" === typeof b && (b = this.findById(b));
    b.view && b.view._toGlobalCoordinate();
    var c = b.getPrevBlock();
    b.separate(a);
    c && c.getNextBlock() && c.getNextBlock().view.bindPrev();
  };
  a.insert = function(b, a, c) {
    "string" === typeof b && (b = this.findById(b));
    this.separate(b, c);
    3 === a.length ? b.moveTo(a[0], a[1]) : 4 === a.length && 0 === a[3] ? (a = this.code.getThreads()[a[2]], b.thread.cut(b), a.insertToTop(b), b.getNextBlock().view.bindPrev()) : (a = a instanceof Array ? this.code.getTargetByPointer(a) : a, a instanceof Entry.Block ? ("basic" === b.getBlockType() && b.view.bindPrev(a), b.doInsert(a)) : a instanceof Entry.FieldStatement ? (b.view.bindPrev(a), a.insertTopBlock(b)) : b.doInsert(a));
  };
  a.adjustThreadsPosition = function() {
  };
  a._initContextOptions = function() {
    var b = this;
    this._contextOptions = [{activated:!0, option:{text:"\ubd99\uc5ec\ub123\uae30", enable:!!Entry.clipboard, callback:function() {
      Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }}}, {activated:!0, option:{text:Lang.Blocks.tidy_up_block, callback:function() {
      b.alignThreads();
    }}}, {activated:!0, option:{text:Lang.Blocks.Clear_all_blocks, callback:function() {
      b.code.clear();
    }}}];
  };
  a.activateContextOption = function(b) {
    this._contextOptions[b].activated = !0;
  };
  a.deActivateContextOption = function(b) {
    this._contextOptions[b].activated = !1;
  };
  a._bindEvent = function() {
    Entry.documentMousedown && (Entry.documentMousedown.attach(this, this.setSelectedBlock), Entry.documentMousedown.attach(this, this._removeActivated));
    Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
    if (Entry.windowResized) {
      var b = _.debounce(this.updateOffset, 200);
      Entry.windowResized.attach(this, b);
    }
  };
  a.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
})(Entry.Board.prototype);
Entry.Code = function(a, b) {
  Entry.Model(this, !1);
  b && (this.object = b);
  this._data = new Entry.Collection;
  this._eventMap = {};
  this._blockMap = {};
  this.executors = [];
  this.executeEndEvent = new Entry.Event(this);
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this._handleChange);
  this._maxZIndex = 0;
  this.load(a);
};
Entry.STATEMENT = 0;
Entry.PARAM = -1;
(function(a) {
  a.schema = {view:null, board:null};
  a.load = function(b) {
    b instanceof Array || (b = JSON.parse(b));
    this.clear();
    for (var a = 0;a < b.length;a++) {
      this._data.push(new Entry.Thread(b[a], this));
    }
    return this;
  };
  a.clear = function() {
    for (var b = this._data.length - 1;0 <= b;b--) {
      this._data[b].destroy(!1);
    }
    this.clearExecutors();
    this._eventMap = {};
  };
  a.createView = function(b) {
    null === this.view ? this.set({view:new Entry.CodeView(this, b), board:b}) : (this.set({board:b}), b.bindCodeView(this.view));
  };
  a.registerEvent = function(b, a) {
    this._eventMap[a] || (this._eventMap[a] = []);
    this._eventMap[a].push(b);
  };
  a.unregisterEvent = function(b, a) {
    (a = this._eventMap[a]) && 0 !== a.length && (b = a.indexOf(b), 0 > b || a.splice(b, 1));
  };
  a.raiseEvent = function(b, a, c) {
    b = this._eventMap[b];
    var e = [];
    if (void 0 !== b) {
      for (var f = 0;f < b.length;f++) {
        var g = b[f];
        if (void 0 === c || -1 < g.params.indexOf(c)) {
          g = new Entry.Executor(b[f], a), this.executors.push(g), e.push(g);
        }
      }
      return e;
    }
  };
  a.getEventMap = function(b) {
    return this._eventMap[b];
  };
  a.map = function(b) {
    this._data.map(b);
  };
  a.tick = function() {
    for (var b = this.executors, a = 0;a < b.length;a++) {
      var c = b[a];
      c.isEnd() || c.execute();
      c.isEnd() && (b.splice(a, 1), a--, 0 === b.length && this.executeEndEvent.notify());
    }
  };
  a.removeExecutor = function(b) {
    b = this.executors.indexOf(b);
    -1 < b && this.executors.splice(b, 1);
  };
  a.clearExecutors = function() {
    this.executors = [];
  };
  a.clearExecutorsByEntity = function(b) {
    for (var a = this.executors, c = 0;c < a.length;c++) {
      var e = a[c];
      e.entity === b && e.end();
    }
  };
  a.addExecutor = function(b) {
    this.executors.push(b);
  };
  a.createThread = function(b, a) {
    if (!(b instanceof Array)) {
      return console.error("blocks must be array");
    }
    b = new Entry.Thread(b, this);
    void 0 === a ? this._data.push(b) : this._data.insert(b, a);
    return b;
  };
  a.cloneThread = function(b, a) {
    b = b.clone(this, a);
    this._data.push(b);
    return b;
  };
  a.destroyThread = function(a, d) {
    d = this._data;
    a = d.indexOf(a);
    0 > a || d.splice(a, 1);
  };
  a.doDestroyThread = function(a, d) {
    d = this._data;
    a = d.indexOf(a);
    0 > a || d.splice(a, 1);
  };
  a.getThreads = function() {
    return this._data.map(function(a) {
      return a;
    });
  };
  a.toJSON = function() {
    for (var a = this.getThreads(), d = [], c = 0, e = a.length;c < e;c++) {
      d.push(a[c].toJSON());
    }
    return d;
  };
  a.countBlock = function() {
    for (var a = this.getThreads(), d = 0, c = 0;c < a.length;c++) {
      d += a[c].countBlock();
    }
    return d;
  };
  a.moveBy = function(a, d) {
    for (var c = this.getThreads(), e = 0, f = c.length;e < f;e++) {
      var g = c[e].getFirstBlock();
      g && g.view._moveBy(a, d, !1);
    }
    a = this.board;
    a instanceof Entry.BlockMenu && a.updateSplitters(d);
  };
  a.stringify = function() {
    return JSON.stringify(this.toJSON());
  };
  a.dominate = function(a) {
    a.view.setZIndex(this._maxZIndex++);
  };
  a.indexOf = function(a) {
    return this._data.indexOf(a);
  };
  a._handleChange = function() {
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  };
  a.hasBlockType = function(a) {
    for (var d = this.getThreads(), c = 0;c < d.length;c++) {
      if (d[c].hasBlockType(a)) {
        return !0;
      }
    }
    return !1;
  };
  a.findById = function(a) {
    return this._blockMap[a];
  };
  a.registerBlock = function(a) {
    this._blockMap[a.id] = a;
  };
  a.unregisterBlock = function(a) {
    delete this._blockMap[a.id];
  };
  a.getByPointer = function(a) {
    a = a.concat();
    a.shift();
    a.shift();
    for (var d = this._data[a.shift()].getBlock(a.shift());a.length;) {
      d instanceof Entry.Block || (d = d.getValueBlock());
      var c = a.shift(), e = a.shift();
      -1 < c ? d = d.statements[c].getBlock(e) : -1 === c && (d = d.view.getParam(e));
    }
    return d;
  };
  a.getTargetByPointer = function(a) {
    a = a.concat();
    a.shift();
    a.shift();
    var d = this._data[a.shift()], c;
    if (1 === a.length) {
      c = d.getBlock(a.shift() - 1);
    } else {
      for (c = d.getBlock(a.shift());a.length;) {
        c instanceof Entry.Block || (c = c.getValueBlock());
        var e = a.shift(), d = a.shift();
        -1 < e ? (c = c.statements[e], c = a.length ? c.getBlock(d) : 0 === d ? c.view.getParent() : c.getBlock(d - 1)) : -1 === e && (c = c.view.getParam(d));
      }
    }
    return c;
  };
  a.getBlockList = function(a) {
    for (var d = this.getThreads(), c = [], e = 0;e < d.length;e++) {
      c = c.concat(d[e].getBlockList(a));
    }
    return c;
  };
})(Entry.Code.prototype);
Entry.CodeView = function(a, b) {
  Entry.Model(this, !1);
  this.code = a;
  this.set({board:b});
  this.svgThreadGroup = b.svgGroup.elem("g");
  this.svgThreadGroup.attr({class:"svgThreadGroup"});
  this.svgThreadGroup.board = b;
  this.svgBlockGroup = b.svgGroup.elem("g");
  this.svgBlockGroup.attr({class:"svgBlockGroup"});
  this.svgBlockGroup.board = b;
  b.bindCodeView(this);
  this.code.map(function(a) {
    a.createView(b);
  });
  a.observe(this, "_setBoard", ["board"]);
};
(function(a) {
  a.schema = {board:null, scrollX:0, scrollY:0};
  a._setBoard = function() {
    this.set({board:this.code.board});
  };
  a.reDraw = function() {
    this.code.map(function(a) {
      a.view.reDraw();
    });
  };
})(Entry.CodeView.prototype);
Entry.ConnectionRipple = {};
(function(a) {
  a.createDom = function(a) {
    this.svgDom || (this._ripple = a.getBoard().svgGroup.elem("circle", {cx:0, cy:0, r:0, stroke:"#888", "stroke-width":10}));
  };
  a.setView = function(a) {
    this._ripple || this.createDom(a);
    var d = this._ripple, c = a.getBoard().svgGroup;
    d.remove();
    a = a.getAbsoluteCoordinate();
    d.attr({cx:a.x, cy:a.y});
    c.appendChild(d);
    d._startTime = new Date;
    return this;
  };
  a.dispose = function() {
    var a = this, d = this._ripple, c = (new Date - d._startTime) / 150;
    1 < c ? d.remove() : (d.attr({r:25 * c, opacity:1 - c}), window.setTimeout(function() {
      a.dispose();
    }, 10));
  };
})(Entry.ConnectionRipple);
Entry.Executor = function(a, b) {
  this.scope = new Entry.Scope(a, this);
  this.entity = b;
  this._callStack = [];
  this.register = {};
};
(function(a) {
  a.execute = function() {
    if (!this.isEnd()) {
      for (;;) {
        try {
          var a = this.scope.block.getSchema().func.call(this.scope, this.entity, this.scope);
        } catch (c) {
          Entry.Utils.stopProjectWithToast(this.scope.block, "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec");
        }
        if (void 0 === a || null === a || a === Entry.STATIC.PASS) {
          if (this.scope = new Entry.Scope(this.scope.block.getNextBlock(), this), null === this.scope.block) {
            if (this._callStack.length) {
              var d = this.scope;
              this.scope = this._callStack.pop();
              if (this.scope.isLooped !== d.isLooped) {
                break;
              }
            } else {
              break;
            }
          }
        } else {
          if (a !== Entry.STATIC.CONTINUE && (a === Entry.STATIC.BREAK || this.scope === a)) {
            break;
          }
        }
      }
    }
  };
  a.stepInto = function(a) {
    a instanceof Entry.Thread || console.error("Must step in to thread");
    a = a.getFirstBlock();
    if (!a) {
      return Entry.STATIC.BREAK;
    }
    this._callStack.push(this.scope);
    this.scope = new Entry.Scope(a, this);
    return Entry.STATIC.CONTINUE;
  };
  a.break = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    return Entry.STATIC.PASS;
  };
  a.breakLoop = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    for (;this._callStack.length && "repeat" !== Entry.block[this.scope.block.type].class;) {
      this.scope = this._callStack.pop();
    }
    return Entry.STATIC.PASS;
  };
  a.end = function() {
    this.scope.block = null;
  };
  a.isEnd = function() {
    return null === this.scope.block;
  };
})(Entry.Executor.prototype);
Entry.Scope = function(a, b) {
  this.type = (this.block = a) ? a.type : null;
  this.executor = b;
  this.entity = b.entity;
};
(function(a) {
  a.callReturn = function() {
  };
  a.getParam = function(a) {
    a = this.block.params[a];
    var d = new Entry.Scope(a, this.executor);
    return Entry.block[a.type].func.call(d, this.entity, d);
  };
  a.getParams = function() {
    var a = this;
    return this.block.params.map(function(d) {
      if (d instanceof Entry.Block) {
        var c = new Entry.Scope(d, a.executor);
        return Entry.block[d.type].func.call(c, a.entity, c);
      }
      return d;
    });
  };
  a.getValue = function(a, d) {
    a = this.block.params[this._getParamIndex(a, d)];
    d = new Entry.Scope(a, this.executor);
    return Entry.block[a.type].func.call(d, this.entity, d);
  };
  a.getStringValue = function(a, d) {
    return String(this.getValue(a, d));
  };
  a.getNumberValue = function(a, d) {
    return Number(this.getValue(a));
  };
  a.getBooleanValue = function(a, d) {
    return Number(this.getValue(a, d)) ? !0 : !1;
  };
  a.getField = function(a, d) {
    return this.block.params[this._getParamIndex(a)];
  };
  a.getStringField = function(a, d) {
    return String(this.getField(a));
  };
  a.getNumberField = function(a) {
    return Number(this.getField(a));
  };
  a.getStatement = function(a, d) {
    return this.executor.stepInto(this.block.statements[this._getStatementIndex(a, d)]);
  };
  a._getParamIndex = function(a) {
    return Entry.block[this.type].paramsKeyMap[a];
  };
  a._getStatementIndex = function(a) {
    return Entry.block[this.type].statementsKeyMap[a];
  };
  a.die = function() {
    this.block = null;
    return Entry.STATIC.BREAK;
  };
})(Entry.Scope.prototype);
Entry.FieldAngle = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = a.position;
  this._contents = a;
  this._index = d;
  a = this.getValue();
  this.setValue(this.modValue(void 0 !== a ? a : 90));
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldAngle);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:4, y:4, "font-size":"9pt"});
    this.textElement.textContent = this.getText();
    var a = this.getTextWidth(), d = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {x:0, y:d - 8, rx:3, ry:3, width:a, height:16, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:16});
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.value);
    this.optionGroup.on("mousedown", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(c) {
      var d = c.keyCode || c.which;
      a.applyValue(c);
      -1 < [13, 27].indexOf(d) && a.destroyOption();
    });
    var d = this.getAbsolutePosFromDocument();
    d.y -= this.box.height / 2;
    this.optionGroup.css({height:16, left:d.x, top:d.y, width:a.box.width});
    this.optionGroup.select();
    this.svgOptionGroup = this.appendSvgOptionGroup();
    this.svgOptionGroup.elem("circle", {x:0, y:0, r:49, class:"entry-field-angle-circle"});
    this._dividerGroup = this.svgOptionGroup.elem("g");
    for (d = 0;360 > d;d += 15) {
      this._dividerGroup.elem("line", {x1:49, y1:0, x2:49 - (0 === d % 45 ? 10 : 5), y2:0, transform:"rotate(" + d + ", 0, 0)", class:"entry-angle-divider"});
    }
    d = this.getAbsolutePosFromBoard();
    d.x += this.box.width / 2;
    d.y = d.y + this.box.height / 2 + 49 + 1;
    this.svgOptionGroup.attr({class:"entry-field-angle", transform:"translate(" + d.x + "," + d.y + ")"});
    var d = a.getAbsolutePosFromDocument(), c = [d.x + a.box.width / 2, d.y + a.box.height / 2 + 1];
    $(this.svgOptionGroup).mousemove(function(d) {
      a.optionGroup.val(a.modValue(function(a, b) {
        var c = b[0] - a[0];
        a = b[1] - a[1] - 49 - 1;
        b = Math.atan(-a / c);
        b = Entry.toDegrees(b);
        b = 90 - b;
        0 > c ? b += 180 : 0 < a && (b += 360);
        return 15 * Math.round(b / 15);
      }(c, [d.clientX, d.clientY])));
      a.applyValue();
    });
    this.updateGraph();
  };
  a.updateGraph = function() {
    this._fillPath && this._fillPath.remove();
    var a = Entry.toRadian(this.getValue()), d = 49 * Math.sin(a), c = -49 * Math.cos(a), a = a > Math.PI ? 1 : 0;
    this._fillPath = this.svgOptionGroup.elem("path", {d:"M 0,0 v -49 A 49,49 0 %LARGE 1 %X,%Y z".replace("%X", d).replace("%Y", c).replace("%LARGE", a), class:"entry-angle-fill-area"});
    this.svgOptionGroup.appendChild(this._dividerGroup);
    this._indicator && this._indicator.remove();
    this._indicator = this.svgOptionGroup.elem("line", {x1:0, y1:0, x2:d, y2:c});
    this._indicator.attr({class:"entry-angle-indicator"});
  };
  a.applyValue = function() {
    var a = this.optionGroup.val();
    isNaN(a) || (a = this.modValue(a), this.setValue(a), this.updateGraph(), this.textElement.textContent = this.getValue(), this.optionGroup && this.optionGroup.val(a), this.resize());
  };
  a.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup && this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._block.view.alignContent();
  };
  a.getTextWidth = function() {
    return this.textElement ? this.textElement.getComputedTextLength() + 8 : 8;
  };
  a.getText = function() {
    return this.getValue() + "\u00b0";
  };
  a.modValue = function(a) {
    return a % 360;
  };
  a.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this.svgOptionGroup && (this.svgOptionGroup.remove(), delete this.svgOptionGroup);
    this.textElement.textContent = this.getText();
    this.command();
  };
})(Entry.FieldAngle.prototype);
Entry.FieldColor = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = a;
  this._index = d;
  this._position = a.position;
  this.key = a.key;
  this.setValue(this.getValue() || "#FF0000");
  this.renderStart(b);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldColor);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-field-color"});
    var a = this._position, d;
    a ? (d = a.x || 0, a = a.y || 0) : (d = 0, a = -8);
    this._header = this.svgGroup.elem("rect", {x:d, y:a, width:14.5, height:16, fill:this.getValue()});
    this._bindRenderOptions();
    this.box.set({x:d, y:a, width:14.5, height:16});
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    var d = Entry.FieldColor.getWidgetColorList();
    this.optionGroup = Entry.Dom("table", {class:"entry-widget-color-table", parent:$("body")});
    for (var c = 0;c < d.length;c++) {
      for (var e = Entry.Dom("tr", {class:"entry-widget-color-row", parent:this.optionGroup}), f = 0;f < d[c].length;f++) {
        var g = Entry.Dom("td", {class:"entry-widget-color-cell", parent:e}), h = d[c][f];
        g.css({"background-color":h});
        g.attr({"data-color-value":h});
        (function(c, d) {
          c.mousedown(function(a) {
            a.stopPropagation();
          });
          c.mouseup(function(c) {
            a.applyValue(d);
            a.destroyOption();
            a._selectBlockView();
          });
        })(g, h);
      }
    }
    d = this.getAbsolutePosFromDocument();
    d.y += this.box.height / 2 + 1;
    this.optionGroup.css({left:d.x, top:d.y});
  };
  a.applyValue = function(a) {
    this.value != a && (this.setValue(a), this._header.attr({fill:a}));
  };
})(Entry.FieldColor.prototype);
Entry.FieldColor.getWidgetColorList = function() {
  return ["#FFFFFF #CCCCCC #C0C0C0 #999999 #666666 #333333 #000000".split(" "), "#FFCCCC #FF6666 #FF0000 #CC0000 #990000 #660000 #330000".split(" "), "#FFCC99 #FF9966 #FF9900 #FF6600 #CC6600 #993300 #663300".split(" "), "#FFFF99 #FFFF66 #FFCC66 #FFCC33 #CC9933 #996633 #663333".split(" "), "#FFFFCC #FFFF33 #FFFF00 #FFCC00 #999900 #666600 #333300".split(" "), "#99FF99 #66FF99 #33FF33 #33CC00 #009900 #006600 #003300".split(" "), "#99FFFF #33FFFF #66CCCC #00CCCC #339999 #336666 #003333".split(" "), "#CCFFFF #66FFFF #33CCFF #3366FF #3333FF #000099 #000066".split(" "), 
  "#CCCCFF #9999FF #6666CC #6633FF #6609CC #333399 #330099".split(" "), "#FFCCFF #FF99FF #CC66CC #CC33CC #993399 #663366 #330033".split(" ")];
};
Entry.FieldDropdown = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = a;
  this._noArrow = a.noArrow;
  this._arrowColor = a.arrowColor;
  this._index = d;
  this.setValue(this.getValue());
  this._CONTENT_HEIGHT = a.dropdownHeight || b.getSkeleton().dropdownHeight || 16;
  this._FONT_SIZE = a.fontSize || b.getSkeleton().fontSize || 12;
  this._ROUND = a.roundValue || 3;
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldDropdown);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this instanceof Entry.FieldDropdownDynamic && this._updateValue();
    var a = this._blockView;
    this.svgGroup = a.contentSvgGroup.elem("g", {class:"entry-field-dropdown"});
    this.textElement = this.svgGroup.elem("text", {x:2});
    this.textElement.textContent = this.getTextByValue(this.getValue());
    var d = this.textElement.getBBox();
    this.textElement.attr({style:"white-space: pre; font-size:" + this._FONT_SIZE + "px", y:.25 * d.height});
    d = this.textElement.getComputedTextLength() + 16;
    this._noArrow && (d -= 12);
    var c = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {width:d, height:c, y:-c / 2, rx:this._ROUND, ry:this._ROUND, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._noArrow || (a = this._arrowColor || a._schema.color, this._arrow = this.svgGroup.elem("polygon", {points:"0,-2.1 6.4,-2.1 3.2,2.1", fill:a, stroke:a, transform:"translate(" + (d - 11) + ",0)"}));
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:d, height:c});
  };
  a.resize = function() {
    var a = this.textElement.getComputedTextLength() + 18;
    this._noArrow ? a -= 14 : this._arrow.attr({transform:"translate(" + (a - 11) + ",0)"});
    this._header.attr({width:a});
    this.box.set({width:a});
    this._block.view.alignContent();
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    for (var d = this._contents.options, d = this._contents.options, c = 0, e = d.length;c < e;c++) {
      var f = d[c], g = f[0], f = f[1], h = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), k = Entry.Dom("span", {class:"left", parent:h});
      Entry.Dom("span", {class:"right", parent:h}).text(g);
      this.getValue() == f && k.text("\u2713");
      (function(c, d) {
        c.bind("mousedown touchstart", function(a) {
          a.stopPropagation();
        });
        c.bind("mouseup touchend", function(c) {
          c.stopPropagation();
          a.applyValue(d);
          a.destroyOption();
          a._selectBlockView();
        });
      })(h, f);
    }
    this._position();
  };
  a._position = function() {
    var a = this.getAbsolutePosFromDocument();
    a.y += this.box.height / 2;
    var d = $(document).height(), c = this.optionGroup.height(), e = this.optionGroup.width();
    if (d < a.y + c) {
      a.x += this.box.width + 1;
      var d = this.getAbsolutePosFromBoard(), f = this._blockView.getBoard().svgDom.height(), f = f - (f - d.y);
      f - 20 < c && this.optionGroup.height(f - f % 20);
      a.y -= this.optionGroup.height();
    } else {
      a.x += this.box.width / 2 - e / 2;
    }
    this.optionGroup.css({left:a.x, top:a.y, width:e + 20});
  };
  a.applyValue = function(a) {
    this.value != a && this.setValue(a);
    this.textElement.textContent = this.getTextByValue(a);
    this.resize();
  };
  a.getTextByValue = function(a) {
    if (!a || "null" === a) {
      return Lang.Blocks.no_target;
    }
    for (var d = this._contents.options, c = 0, e = d.length;c < e;c++) {
      var f = d[c];
      if (f[1] == a) {
        return f[0];
      }
    }
    return Lang.Blocks.no_target;
  };
})(Entry.FieldDropdown.prototype);
Entry.FieldDropdownDynamic = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = a;
  this._index = d;
  this._arrowColor = a.arrowColor;
  d = this._contents.menuName;
  Entry.Utils.isFunction(d) ? this._menuGenerator = d : this._menuName = d;
  this._CONTENT_HEIGHT = a.dropdownHeight || b.getSkeleton().dropdownHeight || 16;
  this._FONT_SIZE = a.fontSize || b.getSkeleton().fontSize || 12;
  this._ROUND = a.roundValue || 3;
  this.renderStart(b);
};
Entry.Utils.inherit(Entry.FieldDropdown, Entry.FieldDropdownDynamic);
(function(a) {
  a.constructor = Entry.FieldDropDownDynamic;
  a._updateValue = function() {
    var a = [];
    Entry.container && (a = this._menuName ? Entry.container.getDropdownList(this._menuName) : this._menuGenerator());
    this._contents.options = a;
    var a = this._contents.options, d = this.getValue();
    d && "null" != d || (d = 0 !== a.length ? a[0][1] : null);
    this.setValue(d);
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    var d;
    d = this._menuName ? Entry.container.getDropdownList(this._contents.menuName) : this._menuGenerator();
    this._contents.options = d;
    for (var c = 0;c < d.length;c++) {
      var e = d[c], f = e[0], e = e[1], g = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), h = Entry.Dom("span", {class:"left", parent:g});
      Entry.Dom("span", {class:"right", parent:g}).text(f);
      this.getValue() == e && h.text("\u2713");
      (function(c, d) {
        c.mousedown(function(a) {
          a.stopPropagation();
        });
        c.mouseup(function(c) {
          c.stopPropagation();
          a.applyValue(d);
          a.destroyOption();
          a._selectBlockView();
        });
      })(g, e);
    }
    this._position();
  };
})(Entry.FieldDropdownDynamic.prototype);
Entry.FieldImage = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this._content = a;
  this.box = new Entry.BoxModel;
  this._size = a.size;
  this._highlightColor = a.highlightColor ? a.highlightColor : "#F59900";
  this._position = a.position;
  this._imgElement = this._path = this.svgGroup = null;
  this._index = d;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldImage);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? this._content.img.replace(".png", "_un.png") : this._content.img;
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgElement = this.svgGroup.elem("image", {href:this._imgUrl, x:0, y:-.5 * this._size, width:this._size, height:this._size});
    this.box.set({x:this._size, y:0, width:this._size, height:this._size});
  };
})(Entry.FieldImage.prototype);
Entry.FieldIndicator = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this._size = a.size;
  this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? a.img.replace(".png", "_un.png") : a.img;
  this._boxMultiplier = a.boxMultiplier || 2;
  this._highlightColor = a.highlightColor ? a.highlightColor : "#F59900";
  this._position = a.position;
  this._index = d;
  this._imgElement = this._path = this.svgGroup = null;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldIndicator);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgElement = this.svgGroup.elem("image", {href:Entry.mediaFilePath + this._imgUrl, x:this._position ? -1 * this._size : 0, y:-1 * this._size, width:2 * this._size, height:2 * this._size});
    var a = "m 0,-%s a %s,%s 0 1,1 -0.1,0 z".replace(/%s/gi, this._size);
    this._path = this.svgGroup.elem("path", {d:a, stroke:"none", fill:"none"});
    this.box.set({width:this._size * this._boxMultiplier + (this._position ? -this._size : 0), height:this._size * this._boxMultiplier});
  };
  a.enableHighlight = function() {
    var a = this._path.getTotalLength(), d = this._path;
    this._path.attr({stroke:this._highlightColor, strokeWidth:2, "stroke-linecap":"round", "stroke-dasharray":a + " " + a, "stroke-dashoffset":a});
    setInterval(function() {
      d.attr({"stroke-dashoffset":a}).animate({"stroke-dashoffset":0}, 300);
    }, 1400, mina.easeout);
    setTimeout(function() {
      setInterval(function() {
        d.animate({"stroke-dashoffset":-a}, 300);
      }, 1400, mina.easeout);
    }, 500);
  };
})(Entry.FieldIndicator.prototype);
Entry.Keyboard = {};
Entry.FieldKeyboard = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = a.position;
  this._contents = a;
  this._index = d;
  this.setValue(String(this.getValue()));
  this._optionVisible = !1;
  this.renderStart(b);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldKeyboard);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text").attr({x:4, y:4, "font-size":"9pt"});
    this.textElement.textContent = Entry.getKeyCodeMap()[this.getValue()];
    var a = this.getTextWidth(), d = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {x:0, y:d - 8, width:a, height:16, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:16});
  };
  a.renderOptions = function() {
    Entry.keyPressed && (this.keyPressed = Entry.keyPressed.attach(this, this._keyboardControl));
    this._optionVisible = !0;
    this._attachDisposeEvent();
    var a = this.getAbsolutePosFromDocument();
    a.x -= this.box.width / 2;
    a.y += this.box.height / 2 + 1;
    this.optionGroup = Entry.Dom("img", {class:"entry-widget-keyboard-input", src:Entry.mediaFilePath + "/media/keyboard_workspace.png", parent:$("body")});
    this.optionGroup.css({left:a.x, top:a.y});
  };
  a.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.disposeEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this._optionVisible = !1;
    this.command();
    this.keyPressed && (Entry.keyPressed.detach(this.keyPressed), delete this.keyPressed);
  };
  a._keyboardControl = function(a) {
    a.stopPropagation();
    if (this._optionVisible) {
      a = a.keyCode;
      var d = Entry.getKeyCodeMap()[a];
      void 0 !== d && this.applyValue(d, a);
    }
  };
  a.applyValue = function(a, d) {
    this.setValue(String(d));
    this.destroyOption();
    this.textElement.textContent = a;
    this.resize();
  };
  a.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  a.getTextWidth = function() {
    return this.textElement.getComputedTextLength() + 8;
  };
  a.destroy = function() {
    this.destroyOption();
    Entry.keyPressed && this.keyPressed && Entry.keyPressed.detach(this.keyPressed);
  };
})(Entry.FieldKeyboard.prototype);
Entry.FieldLineBreak = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this._index = d;
  this.box = new Entry.BoxModel;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldLineBreak);
(function(a) {
  a.renderStart = function() {
  };
  a.align = function(a) {
    var d = this._blockView;
    0 !== d._statements.length && this.box.set({y:(d._statements[a].height || 20) + Math.max(d.contentHeight % 1E3, 30)});
  };
})(Entry.FieldLineBreak.prototype);
Entry.FieldOutput = function(a, b, d, c, e) {
  Entry.Model(this, !1);
  this._blockView = b;
  this._block = b.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = d;
  this.contentIndex = e;
  this._content = a;
  this.acceptType = a.accept;
  this.view = this;
  this.svgGroup = null;
  this._position = a.position;
  this.box.observe(b, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(b.getBoard(), c);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldOutput);
(function(a) {
  a.schema = {magneting:!1};
  a.renderStart = function(a, d) {
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var c = this.getValue();
    c && !c.view && (c.setThread(this), c.createView(a, d));
    this._updateValueBlock(c);
    this._blockView.getBoard().constructor == Entry.BlockMenu && this._valueBlock && this._valueBlock.view.removeControl();
  };
  a.align = function(a, d, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (d = this._position.y));
    var f = this._valueBlock;
    f && (d = -.5 * f.view.height);
    f = "translate(" + a + "," + d + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:d});
  };
  a.calcWH = function() {
    var a = this._valueBlock;
    a ? (a = a.view, this.box.set({width:a.width, height:a.height})) : this.box.set({width:0, height:20});
  };
  a.calcHeight = a.calcWH;
  a.destroy = function() {
  };
  a._inspectBlock = function() {
  };
  a._setValueBlock = function(a) {
    if (a != this._valueBlock || !this._valueBlock) {
      return this._valueBlock = a, this.setValue(a), a && a.setThread(this), this._valueBlock;
    }
  };
  a._updateValueBlock = function(a) {
    a instanceof Entry.Block || (a = void 0);
    this._sizeObserver && this._sizeObserver.destroy();
    this._posObserver && this._posObserver.destroy();
    (a = this._setValueBlock(a)) ? (a = a.view, a.bindPrev(), this._posObserver = a.observe(this, "_updateValueBlock", ["x", "y"], !1), this._sizeObserver = a.observe(this, "calcWH", ["width", "height"])) : this.calcWH();
    this._blockView.alignContent();
    a = this._blockView.getBoard();
    a.constructor === Entry.Board && a.generateCodeMagnetMap();
  };
  a.getPrevBlock = function(a) {
    return this._valueBlock === a ? this : null;
  };
  a.getNextBlock = function() {
    return null;
  };
  a.requestAbsoluteCoordinate = function(a) {
    a = this._blockView;
    var d = a.contentPos;
    a = a.getAbsoluteCoordinate();
    a.x += this.box.x + d.x;
    a.y += this.box.y + d.y;
    return a;
  };
  a.dominate = function() {
    this._blockView.dominate();
  };
  a.isGlobal = function() {
    return !1;
  };
  a.separate = function(a) {
    this.getCode().createThread([a]);
    this.changeEvent.notify();
  };
  a.getCode = function() {
    return this._block.thread.getCode();
  };
  a.cut = function(a) {
    return this._valueBlock === a ? (delete this._valueBlock, [a]) : null;
  };
  a._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m -4,-12 h 3 l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2 h -3 ", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0," + (this._valueBlock ? 12 : 0) + ")"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  a.replace = function(a) {
    var d = this._valueBlock;
    d && (d.view._toGlobalCoordinate(), a.getTerminateOutputBlock().view._contents[1].replace(d));
    this._updateValueBlock(a);
    a.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
  };
  a.setParent = function(a) {
    this._parent = a;
  };
  a.getParent = function() {
    return this._parent;
  };
  a.getThread = function() {
    return this;
  };
  a.getValueBlock = function() {
    return this._valueBlock;
  };
  a.pointer = function(a) {
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.FieldOutput.prototype);
Entry.FieldStatement = function(a, b, d) {
  Entry.Model(this, !1);
  this._blockView = b;
  this.block = b.block;
  this.view = this;
  this._index = d;
  this.acceptType = a.accept;
  this._thread = this.statementSvgGroup = this.svgGroup = null;
  this._position = a.position;
  this.observe(b, "alignContent", ["height"], !1);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(b.getBoard());
};
(function(a) {
  a.schema = {x:0, y:0, width:100, height:20, magneting:!1};
  a.magnet = {next:{x:0, y:0}};
  a.renderStart = function(a) {
    this.svgGroup = this._blockView.statementSvgGroup.elem("g");
    this._nextGroup = this.statementSvgGroup = this.svgGroup.elem("g");
    this._initThread(a);
    this._board = a;
  };
  a._initThread = function(a) {
    var d = this.getValue();
    this._thread = d;
    d.createView(a);
    d.view.setParent(this);
    if (a = d.getFirstBlock()) {
      a.view._toLocalCoordinate(this.statementSvgGroup), this.firstBlock = a;
    }
    d.changeEvent.attach(this, this.calcHeight);
    d.changeEvent.attach(this, this.checkTopBlock);
    this.calcHeight();
  };
  a.align = function(a, d, c) {
    c = void 0 === c ? !0 : c;
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (d = this._position.y));
    var f = "translate(" + a + "," + d + ")";
    this.set({x:a, y:d});
    c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
  };
  a.calcHeight = function() {
    var a = this._thread.view.requestPartHeight(null);
    this.set({height:a});
  };
  a.getValue = function() {
    return this.block.statements[this._index];
  };
  a.requestAbsoluteCoordinate = function() {
    var a = this._blockView.getAbsoluteCoordinate();
    a.x += this.x;
    a.y += this.y;
    return a;
  };
  a.dominate = function() {
    this._blockView.dominate();
  };
  a.destroy = function() {
  };
  a._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      if (this.magneting) {
        var a = this._board.dragBlock.getShadow(), d = this.requestAbsoluteCoordinate(), d = "translate(" + d.x + "," + d.y + ")";
        $(a).attr({transform:d, display:"block"});
        this._clonedShadow = a;
        this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
        a = this._board.dragBlock.getBelowHeight();
        this.statementSvgGroup.attr({transform:"translate(0," + a + ")"});
        this.set({height:this.height + a});
      } else {
        this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), a = this.originalHeight, void 0 !== a && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), delete this.originalHeight), this.statementSvgGroup.attr({transform:"translate(0,0)"}), this.calcHeight();
      }
      (a = this.block.thread.changeEvent) && a.notify();
    }
  };
  a.insertTopBlock = function(a) {
    this._posObserver && this._posObserver.destroy();
    var d = this.firstBlock;
    (this.firstBlock = a) && a.doInsert(this._thread);
    return d;
  };
  a.getNextBlock = function() {
    return this.firstBlock;
  };
  a.checkTopBlock = function() {
    var a = this._thread.getFirstBlock();
    a && this.firstBlock !== a ? (this.firstBlock = a, a.view.bindPrev(this), a._updatePos()) : a || (this.firstBlock = null);
  };
})(Entry.FieldStatement.prototype);
Entry.FieldText = function(a, b, d) {
  this._block = b.block;
  this._blockView = b;
  this._index = d;
  this.box = new Entry.BoxModel;
  this._fontSize = a.fontSize || b.getSkeleton().fontSize || 12;
  this._color = a.color || this._block.getSchema().fontColor || b.getSkeleton().color || "white";
  this._align = a.align || "left";
  this._text = this.getValue() || a.text;
  this.setValue(null);
  this.textElement = null;
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldText);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._text = this._text.replace(/(\r\n|\n|\r)/gm, " ");
    this.textElement = this.svgGroup.elem("text").attr({style:"white-space: pre; font-size:" + this._fontSize + "px", "class":"dragNone", fill:this._color});
    this.textElement.textContent = this._text;
    var a = 0, d = this.textElement.getBoundingClientRect();
    "center" == this._align && (a = -d.width / 2);
    this.textElement.attr({x:a, y:.25 * d.height});
    this.box.set({x:0, y:0, width:d.width, height:d.height});
  };
})(Entry.FieldText.prototype);
Entry.FieldTextInput = function(a, b, d) {
  this._blockView = b;
  this._block = b.block;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = a.position;
  this._contents = a;
  this._index = d;
  this.value = this.getValue() || "";
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldTextInput);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.svgGroup.attr({class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:3, y:4, "font-size":"9pt"});
    this.textElement.textContent = this.truncate();
    var a = this.getTextWidth(), d = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {width:a, height:16, y:d - 8, rx:3, ry:3, fill:"transparent"});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:16});
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.getValue());
    this.optionGroup.on("mousedown", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(c) {
      var d = c.keyCode || c.which;
      a.applyValue(c);
      -1 < [13, 27].indexOf(d) && a.destroyOption();
    });
    var d = this.getAbsolutePosFromDocument();
    d.y -= this.box.height / 2;
    this.optionGroup.css({height:16, left:d.x, top:d.y, width:a.box.width});
    this.optionGroup.focus();
    this.optionGroup.select();
  };
  a.applyValue = function(a) {
    a = this.optionGroup.val();
    this.setValue(a);
    this.textElement.textContent = this.truncate();
    this.resize();
  };
  a.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  a.getTextWidth = function() {
    return this.textElement.getComputedTextLength() + 6 + 2;
  };
})(Entry.FieldTextInput.prototype);
Entry.GlobalSvg = {};
(function(a) {
  a.DONE = 0;
  a._inited = !1;
  a.REMOVE = 1;
  a.RETURN = 2;
  a.createDom = function() {
    if (!this.inited) {
      $("#globalSvgSurface").remove();
      $("#globalSvg").remove();
      var a = $("body");
      this._container = Entry.Dom("div", {classes:["globalSvgSurface", "entryRemove"], id:"globalSvgSurface", parent:a});
      this.svgDom = Entry.Dom($('<svg id="globalSvg" width="10" height="10"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this._container});
      this.svg = Entry.SVG("globalSvg");
      this.top = this.left = 0;
      this._inited = !0;
    }
  };
  a.setView = function(a, d) {
    if (a != this._view && !a.block.isReadOnly() && a.movable) {
      return this._view = a, this._mode = d, d !== Entry.Workspace.MODE_VIMBOARD && a.set({visible:!1}), this.draw(), this.show(), this.align(), this.position(), !0;
    }
  };
  a.draw = function() {
    var a = this._view;
    this._svg && this.remove();
    var d = this._mode == Entry.Workspace.MODE_VIMBOARD;
    this.svgGroup = Entry.SVG.createElement(a.svgGroup.cloneNode(!0), {opacity:1});
    this.svg.appendChild(this.svgGroup);
    d && (a = $(this.svgGroup), a.find("g").css({filter:"none"}), a.find("path").velocity({opacity:0}, {duration:500}), a.find("text").velocity({fill:"#000000"}, {duration:530}));
  };
  a.remove = function() {
    this.svgGroup && (this.svgGroup.remove(), delete this.svgGroup, delete this._view, delete this._offsetX, delete this._offsetY, delete this._startX, delete this._startY, this.hide());
  };
  a.align = function() {
    var a = this._view.getSkeleton().box(this._view).offsetX || 0, d = this._view.getSkeleton().box(this._view).offsetY || 0, a = -1 * a + 1, d = -1 * d + 1;
    this._offsetX = a;
    this._offsetY = d;
    this.svgGroup.attr({transform:"translate(" + a + "," + d + ")"});
  };
  a.show = function() {
    this._container.removeClass("entryRemove");
  };
  a.hide = function() {
    this._container.addClass("entryRemove");
  };
  a.position = function() {
    var a = this._view;
    if (a) {
      var d = a.getAbsoluteCoordinate(), a = a.getBoard().offset();
      this.left = d.x + a.left - this._offsetX;
      this.top = d.y + a.top - this._offsetY;
      this.svgDom.css({transform:"translate3d(" + this.left + "px," + this.top + "px, 0px)"});
    }
  };
  a.terminateDrag = function(a) {
    var d = Entry.mouseCoordinate;
    a = a.getBoard();
    var c = a.workspace.blockMenu, e = c.offset().left, f = c.offset().top, g = c.visible ? c.svgDom.width() : 0;
    return d.y > a.offset().top - 20 && d.x > e + g ? this.DONE : d.y > f && d.x > e && c.visible ? this.REMOVE : this.RETURN;
  };
  a.addControl = function(a) {
    this.onMouseDown.apply(this, arguments);
  };
  a.onMouseDown = function(a) {
    function d(a) {
      var b = a.pageX;
      a = a.pageY;
      var c = e.left + (b - e._startX), d = e.top + (a - e._startY);
      e.svgDom.css({left:c, top:d});
      e._startX = b;
      e._startY = a;
      e.left = c;
      e.top = d;
    }
    function c(a) {
      $(document).unbind(".block");
    }
    this._startY = a.pageY;
    var e = this;
    a.stopPropagation();
    a.preventDefault();
    var f = $(document);
    f.bind("mousemove.block", d);
    f.bind("mouseup.block", c);
    f.bind("touchmove.block", d);
    f.bind("touchend.block", c);
    this._startX = a.pageX;
    this._startY = a.pageY;
  };
})(Entry.GlobalSvg);
Entry.Mutator = function() {
};
(function(a) {
  a.mutate = function(a, d) {
    a = Entry.block[a];
    void 0 === a.changeEvent && (a.changeEvent = new Entry.Event);
    a.template = d.template;
    a.params = d.params;
    a.changeEvent.notify(1);
  };
})(Entry.Mutator);
(function(a) {
})(Entry.Mutator.prototype);
Entry.RenderView = function(a, b) {
  this._align = b || "CENTER";
  a = "string" === typeof a ? $("#" + a) : $(a);
  if ("DIV" !== a.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = a;
  this.viewOnly = !0;
  this.suffix = "renderView";
  this.disableMouseEvent = this.visible = !0;
  this._svgId = "renderView_" + (new Date).getTime();
  this._generateView();
  this.offset = this.svgDom.offset();
  this.setWidth();
  this.svg = Entry.SVG(this._svgId);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.svg && (this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
};
(function(a) {
  a.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  a._generateView = function() {
    this.renderViewContainer = Entry.Dom("div", {"class":"renderViewContainer", parent:this.view});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="renderView" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.renderViewContainer});
  };
  a.changeCode = function(a) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.code = a;
    this.svg || (this.svg = Entry.SVG(this._svgId), this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
    a.createView(this);
    this.align();
    this.resize();
  };
  a.align = function() {
    var a = this.code.getThreads();
    if (a && 0 !== a.length) {
      for (var d = 0, c = "LEFT" == this._align ? 20 : this.svgDom.width() / 2, e = 0, f = a.length;e < f;e++) {
        var g = a[e].getFirstBlock().view;
        g._moveTo(c, d - g.offsetY, !1);
        g = g.svgGroup.getBBox().height;
        d += g + 15;
      }
      this._bBox = this.svgGroup.getBBox();
      this.height = this._bBox.height;
    }
  };
  a.hide = function() {
    this.view.addClass("entryRemove");
  };
  a.show = function() {
    this.view.removeClass("entryRemove");
  };
  a.setWidth = function() {
    this._svgWidth = this.svgDom.width();
    this.offset = this.svgDom.offset();
  };
  a.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  a.resize = function() {
    this.svg && this._bBox && $(this.svg).css("height", this._bBox.height + 10);
  };
})(Entry.RenderView.prototype);
Entry.ThreadView = function(a, b) {
  Entry.Model(this, !1);
  this.thread = a;
  this.svgGroup = b.svgThreadGroup.elem("g");
  this.parent = b;
};
(function(a) {
  a.schema = {height:0, zIndex:0};
  a.destroy = function() {
    this.svgGroup.remove();
  };
  a.setParent = function(a) {
    this.parent = a;
  };
  a.getParent = function() {
    return this.parent;
  };
  a.renderText = function() {
    for (var a = this.thread.getBlocks(), d = 0;d < a.length;d++) {
      a[d].view.renderText();
    }
  };
  a.renderBlock = function() {
    for (var a = this.thread.getBlocks(), d = 0;d < a.length;d++) {
      a[d].view.renderBlock();
    }
  };
  a.requestAbsoluteCoordinate = function(a) {
    var d = this.thread.getBlocks(), c = d.shift(), e = {x:0, y:0};
    for (this.parent instanceof Entry.Board || this.parent instanceof Entry.BlockMenu || (e = this.parent.requestAbsoluteCoordinate());c && c.view !== a && c.view;) {
      c = c.view, e.x += c.x + c.magnet.next.x, e.y += c.y + c.magnet.next.y, c = d.shift();
    }
    return e;
  };
  a.requestPartHeight = function(a, d) {
    d = this.thread.getBlocks();
    for (var c = d.pop(), e = a ? a.magnet.next ? a.magnet.next.y : a.height : 0;c && c.view !== a && c.view;) {
      c = c.view, e = c.magnet.next ? e + c.magnet.next.y : e + c.height, c.dragMode === Entry.DRAG_MODE_DRAG && (e = 0), c = d.pop();
    }
    return e;
  };
  a.dominate = function() {
    this.parent.dominate(this.thread);
  };
  a.isGlobal = function() {
    return this.parent instanceof Entry.Board;
  };
  a.reDraw = function() {
    for (var a = this.thread._data, d = a.length - 1;0 <= d;d--) {
      a[d].view.reDraw();
    }
  };
  a.setZIndex = function(a) {
    this.set({zIndex:a});
  };
})(Entry.ThreadView.prototype);
Entry.Vim = function(a, b) {
  Entry.Vim.MAZE_MODE = 0;
  Entry.Vim.WORKSPACE_MODE = 1;
  Entry.Vim.TEXT_TYPE_JS = 0;
  Entry.Vim.TEXT_TYPE_PY = 1;
  Entry.Vim.PARSER_TYPE_JS_TO_BLOCK = 0;
  Entry.Vim.PARSER_TYPE_PY_TO_BLOCK = 1;
  Entry.Vim.PARSER_TYPE_BLOCK_TO_JS = 2;
  Entry.Vim.PARSER_TYPE_BLOCK_TO_PY = 3;
  Entry.Vim.PYTHON_IMPORT_ENTRY = "import Entry";
  Entry.Vim.PYTHON_IMPORT_HW = "import Hw";
  a = "string" === typeof a ? $("#" + a) : $(a);
  if ("DIV" !== a.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.createDom(a);
  this._mode = Entry.Vim.WORKSPACE_MODE;
  this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS;
  this._parser = new Entry.Parser(this._mode, this._parserType, this.codeMirror);
  Entry.Model(this, !1);
  window.eventset = [];
};
(function(a) {
  a.createDom = function(a) {
    function d(a) {
      var b = e.getCodeToText(a.block);
      e.codeMirror.display.dragFunctions.leave(a);
      a = new MouseEvent("mousedown", {view:window, bubbles:!0, cancelable:!0, clientX:a.clientX, clientY:a.clientY});
      e.codeMirror.display.scroller.dispatchEvent(a);
      var b = b.split("\n"), c = b.length - 1, d = 0;
      b.forEach(function(a, b) {
        e.codeMirror.replaceSelection(a);
        d = e.doc.getCursor().line;
        e.codeMirror.indentLine(d);
        0 !== b && c === b || e.codeMirror.replaceSelection("\n");
      });
    }
    function c(a) {
      e.codeMirror.display.dragFunctions.over(a);
    }
    var e;
    this.view = Entry.Dom("div", {parent:a, class:"entryVimBoard"});
    this.codeMirror = CodeMirror(this.view[0], {lineNumbers:!0, value:"", mode:{name:"javascript", globalVars:!0}, theme:"default", indentUnit:4, indentWithTabs:!0, styleActiveLine:!0, extraKeys:{"Ctrl-Space":"autocomplete"}, lint:!0, viewportMargin:10});
    this.doc = this.codeMirror.getDoc();
    e = this;
    a = this.view[0];
    a.removeEventListener("dragEnd", d);
    a.removeEventListener("dragOver", c);
    a.addEventListener("dragEnd", d);
    a.addEventListener("dragOver", c);
  };
  a.hide = function() {
    this.view.addClass("entryRemove");
  };
  a.show = function() {
    this.view.removeClass("entryRemove");
  };
  a.textToCode = function(a) {
    a === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : a === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    a = this.codeMirror.getValue();
    return this._parser.parse(a);
  };
  a.codeToText = function(a) {
    var d = Entry.stage.selectedObject ? "# " + Entry.stage.selectedObject.name + " \uc624\ube0c\uc81d\ud2b8\uc758 \ud30c\uc774\uc36c \ucf54\ub4dc" : "# \ud30c\uc774\uc36c \ucf54\ub4dc", c = this.workspace.textType;
    c === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : c === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    a = this._parser.parse(a, Entry.Parser.PARSE_SYNTAX);
    a = d.concat("\n\n").concat(Entry.Vim.PYTHON_IMPORT_ENTRY).concat("\n").concat(Entry.Vim.PYTHON_IMPORT_HW).concat("\n\n").concat(a);
    this.codeMirror.setValue(a);
  };
  a.getCodeToText = function(a) {
    var d = this.workspace.textType;
    d === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : d === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    return this._parser.parse(a, Entry.Parser.PARSE_SYNTAX);
  };
})(Entry.Vim.prototype);
Entry.Xml = {};
Entry.Xml.isTypeOf = function(a, b) {
  return b.getAttribute("type") == a;
};
Entry.Xml.getNextBlock = function(a) {
  a = a.childNodes;
  for (var b = 0;b < a.length;b++) {
    if ("NEXT" == a[b].tagName.toUpperCase()) {
      return a[b].children[0];
    }
  }
  return null;
};
Entry.Xml.getStatementBlock = function(a, b) {
  var d = b.getElementsByTagName("statement");
  if (!d.length) {
    return b;
  }
  for (var c in d) {
    if (d[c].getAttribute("name") == a) {
      return d[c].children[0];
    }
  }
  return null;
};
Entry.Xml.getParentLoop = function(a) {
  for (;;) {
    if (!a) {
      return null;
    }
    if ((a = a.parentNode) && "STATEMENT" == a.tagName.toUpperCase()) {
      return a.parentNode;
    }
    if (a) {
      a = a.parentNode;
    } else {
      return null;
    }
  }
};
Entry.Xml.getParentIterateLoop = function(a) {
  for (;;) {
    if (!a) {
      return null;
    }
    if ((a = a.parentNode) && a.getAttribute("type") && "REPEAT" == a.getAttribute("type").toUpperCase().substr(0, 6)) {
      return a;
    }
    if (!a) {
      return null;
    }
  }
};
Entry.Xml.getParentBlock = function(a) {
  return (a = a.parentNode) ? a.parentNode : null;
};
Entry.Xml.callReturn = function(a) {
  var b = Entry.Xml.getNextBlock(a);
  return b ? b : Entry.Xml.getParentLoop(a);
};
Entry.Xml.isRootBlock = function(a) {
};
Entry.Xml.getValue = function(a, b) {
  b = b.childNodes;
  if (!b.length) {
    return null;
  }
  for (var d in b) {
    if ("VALUE" == b[d].tagName.toUpperCase() && b[d].getAttribute("name") == a) {
      return b[d].children[0];
    }
  }
  return null;
};
Entry.Xml.getNumberValue = function(a, b, d) {
  d = d.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if (d[c].tagName && "VALUE" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == b) {
      return Number(Entry.Xml.operate(a, d[c].children[0]));
    }
  }
  return null;
};
Entry.Xml.getField = function(a, b) {
  b = b.childNodes;
  if (!b.length) {
    return null;
  }
  for (var d in b) {
    if (b[d].tagName && "FIELD" == b[d].tagName.toUpperCase() && b[d].getAttribute("name") == a) {
      return b[d].textContent;
    }
  }
};
Entry.Xml.getNumberField = function(a, b) {
  b = b.childNodes;
  if (!b.length) {
    return null;
  }
  for (var d in b) {
    if ("FIELD" == b[d].tagName.toUpperCase() && b[d].getAttribute("name") == a) {
      return Number(b[d].textContent);
    }
  }
};
Entry.Xml.getBooleanValue = function(a, b, d) {
  d = d.getElementsByTagName("value");
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if (d[c].getAttribute("name") == b) {
      return Entry.Xml.operate(a, d[c].children[0]);
    }
  }
  return null;
};
Entry.Xml.operate = function(a, b) {
  return Entry.block[b.getAttribute("type")](a, b);
};
Entry.Xml.cloneBlock = function(a, b, d) {
  var c = a.cloneNode();
  a.parentNode && "xml" != a.parentNode.tagName && Entry.Xml.cloneBlock(a.parentNode, c, "parent");
  for (var e = 0;e < a.childNodes.length;e++) {
    var f = a.childNodes[e];
    f instanceof Text ? c.textContent = f.textContent : "parent" == d ? c.appendChild(b) : c.appendChild(Entry.Xml.cloneBlock(f, c, "child"));
  }
  return c;
};
Entry.Youtube = function(a) {
  this.generateView(a);
};
p = Entry.Youtube.prototype;
p.init = function(a) {
  this.youtubeHash = a;
  this.generateView();
};
p.generateView = function(a) {
  var b = Entry.createElement("div");
  b.addClass("entryContainerMovieWorkspace");
  b.addClass("entryHidden");
  this.movieContainer = b;
  b = Entry.createElement("iframe");
  b.setAttribute("id", "youtubeIframe");
  b.setAttribute("allowfullscreen", "");
  b.setAttribute("frameborder", 0);
  b.setAttribute("src", "https://www.youtube.com/embed/" + a);
  this.movieFrame = b;
  this.movieContainer.appendChild(b);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  var a = document.getElementById("entryContainerWorkspaceId"), b = document.getElementById("youtubeIframe");
  w = a.offsetWidth;
  b.width = w + "px";
  b.height = 9 * w / 16 + "px";
};

