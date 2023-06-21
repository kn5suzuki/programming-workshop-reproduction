import * as Blockly from "blockly/core";
import mahojin_b from "../img/game/mahojin_b.png";
import mahojin_w from "../img/game/mahojin_w2.png";

Blockly.Blocks["move"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Move")
      .appendField(
        new Blockly.FieldDropdown([
          ["→", "0"],
          ["←", "1"],
          ["↑", "2"],
          ["↓", "3"],
        ]),
        "direction"
      );
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["moveForward"] = {
  init: function () {
    this.appendDummyInput().appendField("１マスすすむ");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["turn"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ["右⟳", "0"],
          ["左⟲", "1"],
          ["後ろ", "2"],
        ]),
        "direction"
      )
      .appendField("をむく");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["while"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldLabelSerializable("くり返し"),
      "string"
    );
    this.appendStatementInput("child").setCheck(null);
    this.setPreviousStatement(true);
    this.setColour(210);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["remove"] = {
  init: function () {
    this.appendDummyInput().appendField("岩をのける");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["if"] = {
  init: function () {
    this.appendDummyInput().appendField("もし");
    this.appendValueInput("condition").setCheck(null);
    this.appendDummyInput().appendField("なら");
    this.appendStatementInput("ifTrue");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setColour(120);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["ifelse"] = {
  init: function () {
    this.appendDummyInput().appendField("もし");
    this.appendValueInput("condition").setCheck(null);
    this.appendDummyInput().appendField("なら");
    this.appendStatementInput("ifTrue");
    this.appendDummyInput().appendField("そうでないなら");
    this.appendStatementInput("ifFalse");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setColour(120);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["check"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ["前", "0"],
          ["右", "1"],
          ["左", "2"],
          ["後ろ", "3"],
        ]),
        "direction"
      )
      .appendField("が")
      .appendField(
        new Blockly.FieldDropdown([
          ["道", "movable"],
          ["草", "grass"],
          ["岩", "rock"],
          ["数字", "number"],
          ["土の道", "soil"],
          ["石の道", "stone"],
          ["木の道", "wood"],
        ]),
        "thing"
      );
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
Blockly.Blocks["checkPath"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ["前", "0"],
          ["右", "1"],
          ["左", "2"],
          ["後ろ", "3"],
        ]),
        "direction"
      )
      .appendField("が道");
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["checkFront"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("前が")
      .appendField(
        new Blockly.FieldDropdown([
          ["道", "movable"],
          ["草", "grass"],
          ["岩", "rock"],
          ["数字", "number"],
          ["土の道", "soil"],
          ["石の道", "stone"],
          ["木の道", "wood"],
        ]),
        "thing"
      );
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
/*
Blockly.Blocks['check2'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["前","0"], ["右","1"], ["左","2"],["後ろ","3"]]), "direction")
        .appendField("が")
        .appendField(new Blockly.FieldDropdown([["草","grass"], ["岩","rock"]]), "thing");
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
*/
Blockly.Blocks["grouping"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput("かんすう1"), "group_name")
      .appendField("をていぎ");
    this.appendStatementInput("group_code");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setColour(120);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["callGroup"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput("かんすう1"), "group_name")
      .appendField("を実行");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["and"] = {
  init: function () {
    this.appendValueInput("a").setCheck(null);
    this.appendDummyInput().appendField("かつ");
    this.appendValueInput("b").setCheck(null);
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["or"] = {
  init: function () {
    this.appendValueInput("a").setCheck(null);
    this.appendDummyInput().appendField("または");
    this.appendValueInput("b").setCheck(null);
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["not"] = {
  init: function () {
    this.appendValueInput("a").setCheck(null);
    this.appendDummyInput().appendField("でない");
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
/*
Blockly.Blocks['ifAnd'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("もし");
    this.appendValueInput("cond1")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("かつ");
    this.appendValueInput("cond2")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("なら");
    this.appendStatementInput("ifTrue")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("そうでないなら");
    this.appendStatementInput("ifFalse")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['ifOr'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("もし");
    this.appendValueInput("cond1")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("または");
    this.appendValueInput("cond2")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("なら");
    this.appendStatementInput("ifTrue")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("そうでないなら");
    this.appendStatementInput("ifFalse")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
*/

Blockly.Blocks["canTeleport"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          [{ src: mahojin_b, width: 15, height: 15, alt: "*" }, "black"],
          [{ src: mahojin_w, width: 15, height: 15, alt: "*" }, "white"],
        ]),
        "place"
      )
      .appendField("にいる");
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["teleportation"] = {
  init: function () {
    this.appendDummyInput().appendField("ワープする");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["whileIf"] = {
  init: function () {
    this.appendValueInput("condition").setCheck(null);
    this.appendDummyInput().appendField("であるかぎり");
    this.appendStatementInput("child").setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["check_energy"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("体力が")
      .appendField(
        new Blockly.FieldDropdown([
          ["0以上", "more"],
          ["0より小さい", "less"],
        ]),
        "cond"
      );
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["check3"] = {
  init: function () {
    this.appendDummyInput().appendField("足元の数字が");
    this.appendDummyInput().appendField("持っている数字");
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(
        new Blockly.FieldDropdown([
          ["と等しい", "equal"],
          ["より小さい", "less"],
          ["より大きい", "bigger"],
        ]),
        "operation"
      );
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["pickUpNumber"] = {
  init: function () {
    this.appendDummyInput().appendField("数字をひろう");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["dropNumber"] = {
  init: function () {
    this.appendDummyInput().appendField("数字をおく");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["replaceNumber"] = {
  init: function () {
    this.appendDummyInput().appendField("数字を持ちかえる");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["checkFeet"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("足元が")
      .appendField(
        new Blockly.FieldDropdown([
          ["土の道", "soil"],
          ["数字", "number"],
          ["石の道", "stone"],
          ["木の道", "wood"],
        ]),
        "thing"
      );
    this.setOutput(true, null);
    this.setColour(60);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["putNumber"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ["0", "num0"],
          ["1", "num1"],
          ["2", "num2"],
          ["3", "num3"],
          ["4", "num4"],
          ["5", "num5"],
          ["6", "num6"],
          ["7", "num7"],
          ["8", "num8"],
          ["9", "num9"],
        ]),
        "thing"
      )
      .appendField("を置く");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(270);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
