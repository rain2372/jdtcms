var role_basic = Number(window.sessionStorage.getItem("c_role_basic"));
var role_manage = Number(window.sessionStorage.getItem("c_role_manage"));
var role_send = Number(window.sessionStorage.getItem("c_role_send"));
var role_custom = Number(window.sessionStorage.getItem("c_role_custom"));
var role_option = Number(window.sessionStorage.getItem("c_role_option"));
/*
 * 底部菜单栏组件
 * */
var R_footer = React.createClass({
	render:function(){
		return(
			<footer>
				<hr />
				<p className="am-padding-left">© 2016 上海标锭建设工程服务有限公司.</p>
				<div className="am-alert am-alert-danger none errorinfo" data-am-alert></div>
				<div className="am-alert am-alert-success none successinfo" data-am-alert></div>
				<div className="am-alert am-alert-warning none loadinfo" data-am-alert></div>
			</footer>
		);
	}
});
/*
 * 顶部标题栏组件
 * */
var R_header = React.createClass({
	componentDidMount:function(){
		$('#cname').html(window.sessionStorage.getItem('cname'));
	},
	exit:function(e){
		e.preventDefault();
		window.sessionStorage.removeItem("cname");
		window.sessionStorage.removeItem('cid');
		window.sessionStorage.removeItem("crole");
		window.location = 'login.html';
	},
	render:function(){
		return(
			<header className="am-topbar admin-header">
			  <div className="am-topbar-brand">
			    <strong>建定工程</strong> <small>官方微信后台管理系统</small>
			  </div>
			
			  <button className="am-topbar-btn am-topbar-toggle am-btn am-btn-sm am-btn-success am-show-sm-only" data-am-collapse="{target: '#topbar-collapse'}"><span className="am-sr-only">导航切换</span> <span className="am-icon-bars"></span></button>
			
			  <div className="am-collapse am-topbar-collapse" id="topbar-collapse">
			
			    <ul className="am-nav am-nav-pills am-topbar-nav am-topbar-right admin-header-list">
			      <li><a href="javascript:;"><span className="am-icon-user"></span> 当前用户：<span id="cname"></span> </a></li>
			      <li><a onClick={this.exit} href="#"><span className="am-icon-power-off"></span> 退出</a></li>
			    </ul>
			  </div>
			</header>
		);
	}
});
/*
 * 左侧导航组件
 * */
var R_sidebar = React.createClass({
	componentDidMount:function(){
		var role = window.sessionStorage.getItem('crole');
		if(role_option == 0){
			/*系统设定*/
			$('.admin-sidebar-list').find('li').eq(4).addClass('none');
			/*红包设定*/
			$('.admin-sidebar-list').find('li').eq(5).find('li').eq(1).addClass('none');
			/*管理员管理*/
			$('.admin-sidebar-list').find('li').eq(9).addClass('none');
			/*软文管理*/
			/*$('.admin-sidebar-list').find('li').eq(12).addClass('none');*/
		}
		if(role_send == 0){
			/*红包管理*/
			$('.admin-sidebar-list').find('li').eq(5).addClass('none');
		}
		if(role_option == 1){
			/*修改密码*/
			$('.admin-sidebar-list').find('li').eq(14).addClass('none');
		}
	},
	render:function(){
		return(
			<div className="admin-sidebar am-offcanvas" id="admin-offcanvas">
			    <div className="am-offcanvas-bar admin-offcanvas-bar">
			      <ul className="am-list admin-sidebar-list">
			      	<li><a href="record.html"><span className="am-icon-sitemap"></span>	关注者行为查询</a></li>
			      	<li><a href="index.html"><span className="am-icon-user-plus"></span> 关注者查询</a></li>
			      	<li><a href="rewardpunish.html"><span className="am-icon-clipboard"></span>	奖罚统计</a></li>
			      	<li><a href="query.html"><span className="am-icon-search"></span> 员工业绩查询</a></li>
			       	<li><a href="settings.html"><span className="am-icon-cog"></span> 系统设定</a></li>
			       	<li>
			       		<a href="rpmanage.html"><span className="am-icon-envelope"></span> 红包管理</a>
			       		<ul className="am-list am-collapse admin-sidebar-sub am-in" id="collapse-nav">
				            <li><a href="rpmanage.html"><span className="am-icon-table"></span> 红包发放</a></li>
				            <li><a href="redpacket.html"><span className="am-icon-pencil-square-o"></span> 设定</a></li>
				        </ul>
			       	</li>
					<li>
						<a href="user.html"><span className="am-icon-user"></span> 帐号管理</a>
						<ul className="am-list am-collapse admin-sidebar-sub am-in" id="collapse-nav">
				            <li><a href="user.html"><span className="am-icon-meh-o"></span> 管理员帐号</a></li>
				            <li><a href="jdtuser.html"><span className="am-icon-windows"></span> 建定通账户</a></li>
				            <li><a href="modeluser.html"><span className="am-icon-bell"></span> 积分审核账户</a></li>
				        </ul>
					</li>
					<li className="admin-parent">
						<a href="post.html"><span className="am-icon-wechat"></span> 服务号软文管理</a>
					</li>
					<li><a href="meeting.html"><span className="am-icon-university"></span> 会议报名管理</a></li>
					<li><a href="changePwd.html"><span className="am-icon-gear"></span> 密码修改</a></li>
			      </ul>
			      <div className="fix_bottom"></div>
			    </div>
			</div>
		);
	}
});
/*
 * 内容组件
 * */
var R_main = React.createClass({
	render:function(){
		return(
			<div className="am-cf admin-main">
				{this.props.children}
			</div>
		);
	}
});
/*
 * 移动端菜单组件
 * */
var R_menu = React.createClass({
	render:function(){
		return(
			<a href="#" className="am-icon-btn am-icon-th-list am-show-sm-only admin-menu" data-am-offcanvas="{target: '#admin-offcanvas'}"></a>
		);
	}
});
/*
 * 返回顶部组件
 * */
var R_totop = React.createClass({
	render:function(){
		return(
			<div data-am-widget="gotop" className="am-gotop am-gotop-fixed">
				<a href="#top" title="回到顶部">
					<span className="am-gotop-title">回到顶部</span>
					<i className="am-gotop-icon am-icon-chevron-up"></i>
				</a>
			</div>
		);
	}
});
/*
 * 查询输入框组件
 * */
var R_Input = React.createClass({
	getInitialState: function() { 
		return {close:""};
	},
	searchKey:function(){
		var key = this.refs.key.getDOMNode().value.trim();
		if(!key || key.indexOf("'")!=-1){
			this.props.onsearchKey([]);
			this.setState({close:""});
			return;
		}
		this.setState({close:<i className="am-icon-close close" onclick={this.close}></i>});
		//this.props.onsearchKey(load);
		$.ajax({
			type: "POST",
			url: "/service/SearchByKey",
			data: {
				key: key,
				option_2: window.localStorage.getItem('option_2')
			},
			success: function(data) {
				this.props.onsearchKey(data);
			}.bind(this)
		});
	},
	render:function(){
		return(
			<div className="fixed">
				<div className="am-form-icon">
					<i className="am-icon-search"></i>
					<input type="text" className="am-form-field" ref="key" onInput={this.searchKey} placeholder="邮轮公司/船名/途径港口"></input>
					{this.state.close}
				</div>
			</div>
		);
	}
});
/*
 * 查询结果组件
 * */
var R_Result = React.createClass({
	showDetail:function(url){
		window.open(url);
	},
	render:function(){
		var o = this;
		var list = this.props.date.map(function(c){
		return(
				<li onClick={o.showDetail(c.txtUrl)}>
					<h1><span className="am-badge am-badge-success am-radius ">{c.txtSource}</span>{c.title}</h1>
					<span className="price am-badge am-badge-warning am-radius ">{c.numPrice}</span>
				</li>
			);
		});
		return(
			<div id="result">
				<ul className="am-list">
					{list}
				</ul>
			</div>
		);
	}
});
/*
 * 查询组件
 * */
var R_Search = React.createClass({
	getInitialState: function() { 
		return {res: []};
	},
	handlesearch:function(c){
		this.setState({res: c}); 
	},
	render:function(){
		return(
			
			<form action="" className="am-form am-form-inline">
				<R_Input onsearchKey={this.handlesearch} />
				<R_Result date={this.state.res} />
			</form>
		);
	}
});
/*
 * 数据加载组件
 * */
var R_loading = React.createClass({
	render:function(){
		return(
			<div className="am-modal am-modal-loading am-modal-no-btn" tabIndex="-1" id="my-modal-loading">
				<div className="am-modal-dialog">
					<div className="am-modal-hd">数据加载中...</div>
					<div className="am-modal-bd">
						<span className="am-icon-spinner am-icon-spin"></span>
					</div>
				</div>
			</div>
		);
	}
});
