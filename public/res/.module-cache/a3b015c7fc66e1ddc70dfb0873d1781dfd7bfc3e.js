var R_content = React.createClass({displayName: "R_content",
	componentDidMount:function(){
		var o = this;
		var $modal = $('#my-modal-loading');
		$modal.modal();
		$.ajax({
			type: "post",
			url: hosts + "/settings/getSettings",
			data: {
				
			},
			success: function(data) {
				$("#nickname").html(data[0].nickname);
				$("#openid").html(data[0].openid);
				$("#sex").html(data[0].sex);
				$("#language").html(data[0].language);
				$modal.modal('close');
			}
		});
	},
	setUser:function(e){
		e.preventDefault();
		var userid = $("#wx_user").val();
		var readdocid = window.sessionStorage.getItem("readdocid");
		if(userid == "-"){
			return false;
		}
		$.ajax({
			type: "post",
			url: hosts + "/wx_user/setUser",
			data: {
				userid:userid,
				id:readdocid
			},
			success: function(data) {
				$('.successinfo').html('<p>分配成功</p>').removeClass("none");
				$("#user_id").html(data.name);
				setTimeout(function() {
					$('.successinfo').addClass("none");
				}, 2000);
			}
		});
	},
	render:function(){
		return(
			React.createElement("div", {className: "admin-content"}, 
			
			   	React.createElement("div", {className: "am-cf am-padding"}, 
					React.createElement("div", {className: "am-fl am-cf"}, React.createElement("strong", {className: "am-text-primary am-text-lg"}, "系统设定"), " / ", React.createElement("small", null, "设置"))
				), 

				React.createElement("div", {className: "am-form"}, 
				   
				    React.createElement("div", {className: "am-g am-margin-top"}, 
				    	React.createElement("div", {className: "am-u-sm-12 am-u-md-12 am-text-left"}, 
				       		"首次关注获得的积分", 
				       		React.createElement("input", {type: "text", id: "score_focus", className: "am-input-sm settings_input"})
				       		
				       	)
				    ), 

				    React.createElement("div", {className: "am-g am-margin-top"}, 
				    	React.createElement("div", {className: "am-u-sm-12 am-u-md-12 am-text-left"}, 
				       		"阅读软文获得的积分", 
				       		React.createElement("input", {type: "text", id: "score_read", className: "am-input-sm settings_input"})
				       		
				       	)
				    ), 

				    React.createElement("div", {className: "am-g am-margin-top"}, 
				    	React.createElement("div", {className: "am-u-sm-12 am-u-md-12 am-text-left"}, 
				       		"点赞软文获得的积分", 
				       		React.createElement("input", {type: "text", id: "score_like", className: "am-input-sm settings_input"})
				       		
				       	)
				    ), 

				    React.createElement("div", {className: "am-g am-margin-top"}, 
				    	React.createElement("div", {className: "am-u-sm-12 am-u-md-12 am-text-left"}, 
				       		"转发软文获得的积分", 
				       		React.createElement("input", {type: "text", id: "score_transpond", className: "am-input-sm settings_input"})
				       		
				       	)
				    )

				), 
			    
			  
				
				React.createElement("div", {className: "am-margin"}, 
				   React.createElement("button", {type: "button", onClick: this.createDoc, className: "btn-c am-btn am-btn-primary am-btn-xs"}, "保存")
				)
			)
		);
	}
});