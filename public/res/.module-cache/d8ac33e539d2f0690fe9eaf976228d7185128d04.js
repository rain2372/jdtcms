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
			url: hosts + "/wx_user/getUserById",
			data: {
				id:readdocid
			},
			success: function(data) {
				
				$modal.modal('close');
			}
		});
	},
	render:function(){
		return(
			React.createElement("div", {className: "admin-content"}, 
			
			   	React.createElement("div", {className: "am-cf am-padding"}, 
					React.createElement("div", {className: "am-fl am-cf"}, React.createElement("strong", {className: "am-text-primary am-text-lg"}, "关注者详情"), " / ", React.createElement("small", null, "查看"))
				), 
			    
			    React.createElement("div", {className: "am-tabs am-margin", "data-am-tabs": true}, 
				    React.createElement("ul", {className: "am-tabs-nav am-nav am-nav-tabs"}, 
				      React.createElement("li", {className: "am-active"}, React.createElement("a", {href: "#tab1"}, "关注者基本信息")), 
				      React.createElement("li", null, React.createElement("a", {href: "#tab2"}, "奖罚管理"))
				    ), 
				
				    React.createElement("div", {className: "am-tabs-bd"}, 
				      React.createElement("div", {className: "am-tab-panel am-fade am-in am-active", id: "tab1"}, 
				       	React.createElement("div", {className: "am-form"}, 
				       	
				       		React.createElement("div", {className: "am-g am-margin-top"}, 
					            React.createElement("div", {className: "am-u-sm-4 am-u-md-2 am-text-left"}, 
					              "订单编号"
					            ), 
					            React.createElement("div", {className: "am-u-sm-8 am-u-md-10"}, 
					              this.state.bookingno
					            )
					        )

				        )
				      ), 
				      React.createElement("div", {className: "am-tab-panel am-fade", id: "tab2"}, 
				       	React.createElement("div", {className: "am-form"}

				        )
				      )
				    )
				), 
				
				React.createElement("div", {className: "am-margin"}, 
				    React.createElement("button", {type: "button", onClick: this.cancleDoc, className: "btn-c am-btn am-btn-primary am-btn-xs"}, "关闭")
				)
			)
		);
	}
});