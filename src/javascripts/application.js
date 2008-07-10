function DragWidget(root) {
	this.root = root;
	
	$('li', this.root).click(function() {
	
	});
	
	$('li', this.root).mousedown(function() {
	
	});
	
}

DragWidget.prototype = {
	getSelection: function() {
		return $('li.selected', this.root);
	},
	clearSelection: function() {
		$('li', this.root).removeClass('selected');
	},
	toggleSelected: function(ele) {
		$(ele).toggleClass('selected');
	}
}

$(function() {

	new DragWidget(document.getElementById('tree'));

		
});
