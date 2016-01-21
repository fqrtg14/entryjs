/*
 *
 */
"use strict";

goog.provide("Entry.Workspace");
goog.require("Entry.Model");

Entry.Workspace = function(options) {
    Entry.Model(this, false);

    var option = options.blockMenu;
    if (option) {
        this.blockMenu = new Entry.BlockMenu(
            option.dom,
            option.align,
            option.categoryData
        );
        this.blockMenu.workspace = this;
        this.blockMenu.observe(this, "_setSelectedBlockView", ["selectedBlockView"], false);
    }

    option = options.board;
    if (option) {
        this.board = new Entry.Board(option.dom);
        this.board.workspace = this;
        this.board.observe(this, "_setSelectedBlockView", ["selectedBlockView"], false);
    }

    option = options.vimBoard;
    if (option) {
        this.vimBoard = new Entry.Vim(option.dom);
        this.vimBoard.workspace = this;
    }

    if (this.board && this.vimBoard)
        this.vimBoard.hide();

    Entry.GlobalSvg.createDom();

    this.mode = Entry.Workspace.MODE_BOARD;
    this.selectedBoard = this.board;
};

Entry.Workspace.MODE_BOARD = 0;
Entry.Workspace.MODE_VIMBOARD = 1;

(function(p) {
    p.schema = {
        selectedBlockView: null
    };
    p.getBoard = function(){return this.board;};

    p.getBlockMenu = function(){return this.blockMenu;};

    p.getVimBoard = function(){return this.vimBoard;};

    p.getMode = function() {return this.mode;};

    p.setMode = function(mode){
        mode = Number(mode);
        if (this.mode == mode) return;
        if (mode == Entry.Workspace.MODE_VIMBOARD) {
            if (this.board) this.board.hide();
            this.selectedBoard = this.vimBoard;
            this.vimBoard.show();
            this.vimBoard.codeToText(this.board.code);
            this.blockMenu.renderText();
            this.board.clear();
        } else {
            if (this.vimBoard) this.vimBoard.hide();
            this.selectedBoard = this.board;
            this.board.show();
            this.textToCode();
            this.blockMenu.renderBlock();
        }
        this.mode = mode;
    };

    p.changeBoardCode = function(code) {
        this.selectedBoard.changeCode(code);
    };

    p.changeBlockMenuCode = function(code) {
        this.blockMenu.changeCode(code);
    };

    p.textToCode = function() {
        if (this.mode != Entry.Workspace.MODE_VIMBOARD) return;
        var changedCode = this.vimBoard.textToCode();
        this.board.code.load(changedCode);
        this.board.alignThreads();
    };

    p.codeToText = function(code) {
        return this.vimBoard.codeToText(code);
    };

    p.getCodeToText = function(code) {
        return this.vimBoard.getCodeToText(code);
    };

    p._setSelectedBlockView = function() {
        var blockView = this.board.selectedBlockView || this.blockMenu.selectedBlockView;
        this.set({selectedBlockView:blockView});
    };


})(Entry.Workspace.prototype);
