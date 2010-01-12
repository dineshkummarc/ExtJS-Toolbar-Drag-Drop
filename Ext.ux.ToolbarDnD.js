/* Author : Florian Cargoët
 * Licence : GPL3
 * Usage :
 * in a toolbar config object :
 *  plugins[
 *      new Ext.ux.ToolbarDnD({
 *          group:'aDragAndDropGroupName'
 *      });
 *  ]
 * TODO :
 *  - set up a working html exemple
 *  - use a auto-default group name
 *  - write more readable code (at least, not everything in init)
 */

Ext.ns('Ext.ux');

Ext.ux.ToolbarDnD = function(config){
    Ext.apply(this,config);
}
Ext.ux.ToolbarDnD.prototype.init = function(theToolbar){
    var tbDragZoneOverrides = {
        scroll:false,
        getDragData : function(evtObj){
            var sourceEl = evtObj.getTarget('td.x-toolbar-cell', 10);
            if (sourceEl) {
                var dragItem = this.toolbar.findBy(function(item){
                 //gets the toolbar item wrapping node (td) and compares it to the sourceEl
                    return item.getResizeEl().parent('',true) == sourceEl;
                });
                return {
                    repairXY : Ext.fly(sourceEl).getXY(),
                    dragItem : dragItem[0],
                    ddel : sourceEl
                };
            }
        },
        getRepairXY: function() {
            return this.dragData.repairXY;
        }
    };
    var tbDragZoneCfg = Ext.apply({},{
        toolbar:theToolbar,
        ddGroup:this.group
    },tbDragZoneOverrides);

    var tbDropZoneOverrides = {
        onContainerOver : function(ddSrc,e,ddData){
            this.clearDDStyles();
            var itemUnder  = e.getTarget('td.x-toolbar-cell',10,true);
            var itemWidth;
            if(itemUnder == this.itemUnder){
                        //we already know the width
                itemWidth = this.itemWidth;
            }else{
                delete this.itemWidth//uncache if not relevant
            }
            this.itemUnder = itemUnder;//save it for other drop operation & clearStyles
                
            if(itemUnder){
                itemWidth = this.itemWidth||itemUnder.getWidth();//use cache if exists
                this.itemWidth = itemWidth;//cache it
                var itemLeft  = itemUnder.getX();
                var itemCtr   = itemLeft + Math.floor(itemWidth /2);
                var mouseX   = e.getXY()[0];
                if(mouseX < itemCtr){
                    itemUnder.addClass('tb-item-over-left');
                    this.dropAfter=0;
                }
                else{
                    itemUnder.addClass('tb-item-over-right');
                    this.dropAfter=1;
                }
                        
            }
            else{//nothing under
            }
            return this.dropAllowed;
        },
        onContainerDrop : function(dropZone, e, dragData){
            this.clearDDStyles();
            var dropIndex,itemUnder=this.itemUnder;
                
            dropIndex = this.dropAfter + Ext.each(this.toolbar.items.items,function(item,index){
                if(item.getResizeEl().parent('') == itemUnder){
                    return false;
                }
            });
            this.toolbar.insert(dropIndex,dragData.dragItem);
            this.toolbar.doLayout();
            return true;
        },
        clearDDStyles : function(){
            if(this.itemUnder){
                this.itemUnder.removeClass('tb-item-over-left');
                this.itemUnder.removeClass('tb-item-over-right');
            }
        },
        notifyOut: function(){
            this.clearDDStyles();
        }
    };

    var tbDropZoneCfg= Ext.apply({},{
        ddGroup:this.group,
        toolbar:theToolbar
    },tbDropZoneOverrides);

    theToolbar.on('render',function(toolbar){
        new Ext.dd.DragZone(toolbar.getEl(), tbDragZoneCfg);
        new Ext.dd.DropZone(toolbar.el, tbDropZoneCfg);
    });
}