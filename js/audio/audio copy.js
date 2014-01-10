(function(Audio, $){
	var nodeList = [];

	function fetchDom() {
		$('#URL').submit(function(){
			var url = $('input').val();
			var pattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/

			if(!pattern.test(url)) {
				alert('bad');
				return false;
			}

			$.get('proxy.php?url='+url, function(dom){
				parseDom(dom);
			});

			return false;
		});
	}

	function parseDom(dom){
		var treeWalker = document.createTreeWalker(document.body,  NodeFilter.SHOW_ELEMENT,
			{ acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } },
			false
		);


		while(treeWalker.nextNode()) nodeList.push(treeWalker.currentNode); 
	}


	Audio.start = function() {

	}

	$(Audio.start);


})(Audio || window.Audio, jQuery)


