var R_content = React.createClass({displayName: "R_content",
	cancleDoc:function(){
		history.go(-1);
	},
	componentDidMount:function(){
		var o = this;
		var $modal = $('#my-modal-loading');
		$modal.modal();
		var readdocid = window.sessionStorage.getItem("readdocid");
		$.ajax({
			type: "post",
			url: hosts + "/post/getPostById",
			data: {
				id:readdocid
			},
			success: function(data) {
				o.setState({bookingno:data[0].bookingno});
	
				$modal.modal('close');
			}
		});
	},
	render:function(){
		return(
			React.createElement("div", {className: "am-g am-g-fixed blog-g-fixed"}, 
				React.createElement("div", {className: "am-u-md-12"}, 
					React.createElement("article", {className: "blog-main"}, 
						React.createElement("h3", {className: "am-article-title blog-title"}, "标题"), 
						React.createElement("h4", {class: "am-article-meta blog-meta"}, "by ", React.createElement("a", {href: ""}, "陈叔叔"), " posted on 2016-04-07"), 
						React.createElement("div", {class: "am-g"}, 
							React.createElement("div", {class: "am-u-sm-12"}, 
								"文章内容"
							)
						)
					)
				)
			)
		);
	}
});