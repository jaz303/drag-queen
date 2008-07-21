function DragWidget(root) {
	
	var self = this;
	
	this.root           = root;
	this.dragState      = 'off';
	this.dragStart      = null;
	
	this.attachBehaviours(root);
	
	this.dragBadge = $('<div id="drag-badge"></div>').hide().appendTo(document.body);
	
	$(this.root).mousemove(function(evt) {
	    if (self.dragState == 'active') self.updateDragBadge(evt);
	});
	
}

DragWidget.prototype = {
    hasSelection: function() {
        return $this.getSelection().length > 0;
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
    	    $(this).removeClass('drop-target-valid');
    	    $(this).removeClass('drop-target-invalid');
    	});

    	$('.item', this.root).mousedown(function(evt) {
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
    	    if (self.dragState == 'active') {
    	        if (self.nodeAcceptsDrop(self.nodeFor(this))) {
    	            var target = $('+ ul', this);
    	            if (!target.length) target = $('<ul></ul>').insertAfter(this);
    	            $.each(self.getSelection(), function(ele) {
                       $(this).parents('li:eq(0)').appendTo(target);
                    });
                    self.clearSelection();
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
	}
}

$(function() {

	new DragWidget(document.getElementById('tree'));

		
});
