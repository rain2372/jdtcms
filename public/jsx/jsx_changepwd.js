var R_content = React.createClass({
	createDoc:function(){
		var oldpwd = $('#oldpwd').val();
		var newpwd = $('#newpwd').val();
		var newpwd1 = $('#newpwd1').val();
		
		if(!oldpwd){
			$('.errorinfo').html('<p>旧密码不能为空</p>').removeClass("none");
			setTimeout(function() {
				$('.errorinfo').addClass("none");
			}, 2000);
			return false;
		}
		
		if(!newpwd || !newpwd1){
			$('.errorinfo').html('<p>新密码不能为空</p>').removeClass("none");
			setTimeout(function() {
				$('.errorinfo').addClass("none");
			}, 2000);
			return false;
		}
		
		if(newpwd != newpwd1){
			$('.errorinfo').html('<p>两次输入的密码不一致</p>').removeClass("none");
			setTimeout(function() {
				$('.errorinfo').addClass("none");
			}, 2000);
			return false;
		}
		
		$.ajax({
			type: "post",
			url: hosts + "/user/changePwd",
			data: {
				oldpwd:oldpwd,
				newpwd:newpwd,
				id:window.sessionStorage.getItem("cid")
			},
			success: function(data) {
				if(data == "300"){
					$('.successinfo').html('<p>修改成功</p>').removeClass("none");
					setTimeout(function() {
						window.location.reload();
					}, 1000);
				}else{
					$('.errorinfo').html('<p>旧密码错误</p>').removeClass("none");
					setTimeout(function() {
						$('.errorinfo').addClass("none");
					}, 2000);
				}
			}
		});
	},
	componentDidMount:function(){
		var o = this;
		
	},
	render:function(){
		var o = this;
		return(
			<div className="admin-content">
			
			    <div className="am-cf am-padding">
			      <div className="am-fl am-cf"><strong className="am-text-primary am-text-lg">修改密码</strong> / <small>表单</small></div>
				</div>
			    
			    <div className="am-form">
			    	
				    <div className="am-g am-margin-top">
				        <div className="am-u-sm-4 am-u-md-2 am-text-right">
				            旧密码
				        </div>
				        <div className="am-u-sm-8 am-u-md-4">
				            <input type="password" id="oldpwd" className="am-input-sm settings_input" />
				        </div>
				        <div className="am-hide-sm-only am-u-md-6">*必填</div>
				    </div>  
			    
				    <div className="am-g am-margin-top">
				        <div className="am-u-sm-4 am-u-md-2 am-text-right">
				            新密码
				        </div>
				        <div className="am-u-sm-8 am-u-md-4">
				            <input type="password" id="newpwd" className="am-input-sm settings_input" />
				        </div>
				        <div className="am-hide-sm-only am-u-md-6">*必填</div>
				    </div>   
				

				
				    <div className="am-g am-margin-top">
				        <div className="am-u-sm-4 am-u-md-2 am-text-right">
				            确认新密码
				        </div>
				        <div className="am-u-sm-8 am-u-md-4">
				            <input type="password" id="newpwd1" className="am-input-sm settings_input" />
				        </div>
				        <div className="am-hide-sm-only am-u-md-6">*必填</div>
				    </div>   
			
				
				</div>
				
				<div className="am-margin">
				    <button type="button" onClick={this.createDoc} className="btn-c am-btn am-btn-primary am-btn-xs">保存</button>
				</div>
			</div>
		);
	}
});