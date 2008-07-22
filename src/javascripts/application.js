function DragWidget(root) {
	
	var self = this;
	
	this.root           = root;
	this.dragState      = 'off';
	this.locked			= false;
	
	this.attachBehaviours(root);
	this.dragBadge = $('<div id="drag-badge"></div>').hide().appendTo(document.body);
	
	$(this.root).mousemove(function(evt) {
	    if (self.dragState == 'active') self.updateDragBadge(evt);
	});
	
}

DragWidget.prototype = {
	
	//
	// Locking
	
	lock: function() { this.locked = true; },
	unlock: function() { this.locked = false; },
	isLocked: function() { return this.locked; },
	
	//
	// Selections
	
	hasSelection: function() {
        return this.getSelection().length > 0;
    },

	getSelection: function() {
		return $('.item.selected', this.root);
	},
	
	clearSelection: function() {
		$('.item', this.root).removeClass('selected');
	},
	
	makeSelected: function(ele) {
	    $(ele).addClass('selected');
	},
	
	toggleSelected: function(ele) {
		$(ele).toggleClass('selected');
	},
	
	//
	// Mojo
	
    attachBehaviours: function(root) {
	    
	    var self = this;
	    
	    $('.item', root).each(function() {
	       this.onselectstart = function() { return false; };
	       this.unselectable = 'on';
	       this.style.MozUserSelect = 'none';
        });
	    
	    $('.item', root).hover(function() {
            if (self.dragState == 'active') {
                if (self.nodeAcceptsDrop(self.nodeFor(this))) {
                    $(this).addClass('drop-target-valid');
                } else {
                    $(this).addClass('drop-target-invalid');
                }
            }
    	}, function() {
    	    $(this).removeClass('drop-target-valid')
				   .removeClass('drop-target-invalid');
    	});

    	$('.item', this.root).mousedown(function(evt) {
			if (self.isLocked()) return;
    	    if (!evt.metaKey) self.clearSelection();
	        self.toggleSelected(this);
    	    self.dragState = 'waiting';
            self.dragStart = [evt.pageX, evt.pageY];
        });
        
        $('.item', this.root).mousemove(function(evt) {
            if (self.dragState == 'waiting') {
                var dx = Math.abs(evt.pageX - self.dragStart[0]);
                var dy = Math.abs(evt.pageY - self.dragStart[1]);
                if (dx > 2 || dy > 2) {
                    self.makeSelected(this);
                    self.dragState = 'active';
                }
            }
        });

    	$('.item', this.root).mouseup(function(evt) {
			var target = this;
    	    if (self.dragState == 'active') {
    	        if (self.nodeAcceptsDrop(self.nodeFor(target))) {
					var success = function() {
						var targetList = $('+ ul', target);
						if (!targetList.length) targetList = $('<ul></ul>').insertAfter(target);
						$.each(self.getSelection(), function(ele) {
							$(this).parents('li:eq(0)').appendTo(targetList);
						});
						self.clearSelection();
					}
					self.dropWillOccur(self.nodeFor(target), success);
				}
    	        self.dragBadge.hide();
    	    }
    	    self.dragState = 'off';
    	});
    	
	},
	
	updateDragBadge: function(evt) {
	    this.dragBadge.text(this.getSelection().length)
	                  .show()
	                  .css({left: evt.pageX + 10 + "px",
	                        top: evt.pageY + 10 + "px"});
	},
	
	//
	// Node functions
	
	getSelectedNodes: function() {
        return this.nodesFor(this.getSelection());
    },
	
	nodesFor: function(nodes) {
	    var self = this;
	    return $.map(nodes, function(n) { return self.nodeFor(n); });
	},
	
	//
	// User-overridable node functions
	
	// takes a an inner tree elment (i.e. ".item") and converts it to
	// your app's native node representation. the default behaviour is
	// to return the parent <li> element.
	nodeFor: function(ele) {
	    return ele.parentNode;
	},
	
	// returns a node's parent.
	nodeParent: function(node) {
	    return node.parentNode;
	},
	
	// returns true iff a node is capable of containing children, false otherwise.
	nodeIsContainer: function(node) {
	    return true;
	},
	
	// returns true iff two nodes are equal.
	nodeEquals: function(left, right) {
	    return left == right;
	},
	
	// returns true iff a node is a valid drop target for the current selection.
	nodeAcceptsDrop: function(targetNode) {
	    if (!this.nodeIsContainer(targetNode)) return false;
	    var selectedNodes = this.getSelectedNodes();
        for (var i = 0; i < selectedNodes.length; i++) {
            var tmp = targetNode;
            while (tmp) {
                if (this.nodeEquals(tmp, selectedNodes[i])) return false;
                tmp = this.nodeParent(tmp);
            }
        }
        return true;
	},
	
	//
	// User-overridable event hooks
	
	/**
	 * called when items have been dropped onto a node, after a nodeAcceptsDrop
	 * test has been passed. a success function is supplied in order to commit
	 * the drop; this enables asynchronous (e.g. ajax) operation.
	 * if for some reason the drop fails, simply don't call success() and the
	 * nodes will remain where they are.
	 *
	 * if you're going to do anything that takes a significant amount of time
	 * it's probably best to lock() the widget - remember to unlock() after...
	 *
	 * it is permissible to modify the selection in this function. this is useful,
	 * say, in the case of an ajax update which partially succeeds.
	 *
	 * @param targetNode node that selection has been dropped onto
	 * @param success call this function to commit the drop
	 */
	dropWillOccur: function(targetNode, success) {
		success();
	}
	
}

$(function() {

	new DragWidget(document.getElementById('tree'));

});
