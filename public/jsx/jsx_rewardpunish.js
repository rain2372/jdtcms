var R_content = React.createClass({
	getInitialState: function() { 
		var role = window.sessionStorage.getItem("crole");
		var isAdmin = (role=="管理员")?"":"none";
		return {data: [],total:0,totalpage: [],isFirst:"am-disabled",isLast:"am-disabled",isAdmin:isAdmin};
	},
	newDoc:function(){
		window.sessionStorage.setItem("mode","new");
		window.sessionStorage.removeItem("editid");
		window.sessionStorage.removeItem("startDate");
		window.location = 'userform.html';
	},
	readDoc:function(id){
		window.sessionStorage.setItem("readdocid",id);
		window.location = 'booking_read.html';
	},
	delDoc:function(id,e){
		var o = this;
		e.preventDefault();
		window.sessionStorage.setItem("delid",id);
		$("#del-confirm").modal();
	},
	editDoc:function(id,startDate,e){
		var o = this;
		e.preventDefault();
		window.sessionStorage.setItem("editid",id);
		window.sessionStorage.setItem("mode","edit");
		window.location = 'userform.html';
	},
	delsql:function(){
		var o = this;
		$.ajax({
			type: "post",
			url: hosts + "/user/delUser",
			data: {
				id:window.sessionStorage.getItem("delid")
			},
			success: function(data) {
				if(data == "300"){
					o.toPage(window.sessionStorage.getItem("indexPage"));
					$('.successinfo').html('<p>删除成功</p>').removeClass("none");
					setTimeout(function() {
						$('.successinfo').addClass("none");
					}, 2000);
				}
			}
		});
	},
	toPage:function(page,e){
		var o = this;
		if(e){
			e.preventDefault();
		}
		window.sessionStorage.setItem("indexPage",page);
		var indexPage = window.sessionStorage.getItem("indexPage");
		var id = window.sessionStorage.getItem('cid');
		var role = window.sessionStorage.getItem("crole");
		indexPage = indexPage?indexPage:1;
		$.ajax({
			type: "post",
			url: hosts + "/wx_user/getAllRPScore",
			data: {
				indexPage:indexPage
			},
			success: function(data) {
				o.setState({data:data.record});
				o.setState({total:data.total});
				o.setState({totalpage:data.totalpage});
				o.setState({isFirst:(data.isFirstPage?"am-disabled":"")});
				o.setState({isLast:(data.isLastPage?"am-disabled":"")});
			}
		});
	},
	getXls:function(){
		/*生成openid.txt*/
		$.ajax({
			type: "post",
			url: hosts + "/redpacket/getXls",
			data: {
				
			},
			success: function(data) {
				$('.successinfo').html('<p>导出成功</p>').removeClass("none");
				setTimeout(function() {
					$('.successinfo').addClass("none");
				}, 2000);
				$("#file").html('<span class="am-icon-file-o"></span> <a target="_blank" href="'+hosts+'/txt/openlist.txt">openlist.txt</a>');
			}
		});
	},
	componentDidMount:function(){
		var o = this;
		var $modal = $('#my-modal-loading');
		$modal.modal();
		var indexPage = window.sessionStorage.getItem("indexPage");
		var id = window.sessionStorage.getItem('cid');
		indexPage = indexPage?indexPage:1;
		$.ajax({
			type: "post",
			url: hosts + "/wx_user/getAllRPScore",
			data: {
				indexPage:indexPage
			},
			success: function(data) {
				o.setState({data:data.record});
				o.setState({total:data.total});
				o.setState({totalpage:data.totalpage});
				o.setState({isFirst:(data.isFirstPage?"am-disabled":"")});
				o.setState({isLast:(data.isLastPage?"am-disabled":"")});
				$modal.modal('close');
			}
		});
	},
	render:function(){
		var o = this;
		var list = this.state.data.map(function(c){
		return(
				<tr>
				  <td>{c.openid}</td>
				  <td>{c.nickname}</td>
	              <td>{c.name}</td>
				  <td>{c.number}</td>
			      <td>{new Date(c.time).Format("yyyy-MM-dd hh:mm:ss")}</td>
			      <td>{c.txtRemark}</td>
	              <td>
	                <div className="am-hide-sm-only am-btn-toolbar">
	                  <div className="am-btn-group am-btn-group-xs">
	                  </div>
	                </div>
	              </td>
	            </tr>
			);
		});
		var pager=[];
		var iPa = Number(window.sessionStorage.getItem("indexPage"));
		iPa = iPa?iPa:1;
        for(var i=1;i<(this.state.totalpage)+1;i++){
        	var hasClass = "";
        	if(i == iPa){
        		hasClass = "am-active";
        	}
            pager.push(
                <li className={hasClass}><a href="#" onClick={o.toPage.bind(o,i)}>{i}</a></li>
            )
        }
		return(
			<div className="admin-content">
			
			    <div className="am-cf am-padding">
			      <div className="am-fl am-cf"><strong className="am-text-primary am-text-lg">奖罚统计</strong> / <small>列表</small></div>
				</div>
				
			
				<div className="am-tabs am-margin" data-am-tabs>
				    <ul className="am-tabs-nav am-nav am-nav-tabs">
				      <li className="am-active"><a href="#tab1">奖罚情况</a></li>
				      <li><a href="#tab2">群发新手红包</a></li>
				    </ul>
				    
				    <div className="am-tabs-bd">
				      <div className="am-tab-panel am-fade am-in am-active" id="tab1">
				      		
						    <div className="am-g">
							    <div className="am-u-sm-12">
							        <form className="am-form">
							          <table className="am-table am-table-striped am-table-hover table-main">
							            <thead>
							              <tr>
							              	<th>openid</th>
							              	<th>昵称</th>
							                <th>奖罚行为</th>
						              		<th>奖罚内容</th>
						              		<th>时间</th>
						              		<th>备注</th>
						            		<th className="am-hide-sm-only table-set"></th>
							              </tr>
							          	</thead>
							          	<tbody>
							          		{list}
							          	</tbody>
							          </table>
							          	<div className="am-cf">
										  共 {this.state.total} 条记录
										  <div className="am-fr">
										    <ul className="am-pagination">
										      <li className={this.state.isFirst}><a href="#" onClick={this.toPage.bind(this,Number(window.sessionStorage.getItem("indexPage"))-1)}>«</a></li>
										      {pager}
										      <li className={this.state.isLast}><a href="#" onClick={this.toPage.bind(this,Number(window.sessionStorage.getItem("indexPage"))+1)}>»</a></li>
										    </ul>
										  </div>
										</div>
							        </form>
							    </div>
							</div>
				      </div>
				      <div className="am-tab-panel am-fade" id="tab2">
				      	<button type="button" onClick={this.getXls} className="am-btn am-btn-default"><span className="am-icon-file-excel-o"></span> 导出openid列表</button>						        
				      	<div id="file"></div>
				      	<div className="am-panel am-panel-default admin-sidebar-panel">
					        <div className="am-panel-bd">
					          <p><span className="am-icon-bookmark"></span> 说明：</p>
					          <p>1.先点击导出openid.txt</p>
					          <p>2.进入微信支付商户平台-营销中心-现金红包-管理红包</p>
					          <p>3.点击发送红包，上传openid.txt</p>
							</div>
					    </div> 
				      </div>
				    </div>
				</div>
		

				<div className="am-modal am-modal-confirm" tabIndex="-1" id="del-confirm">
				  <div className="am-modal-dialog">
				    <div className="am-modal-hd">提示</div>
				    <div className="am-modal-bd">
				      你，确定要删除这条记录吗？
				    </div>
				    <div className="am-modal-footer">
				      <span className="am-modal-btn" data-am-modal-cancel>取消</span>
				      <span className="am-modal-btn" data-am-modal-confirm onClick={this.delsql}>确定</span>
				    </div>
				  </div>
				</div>
			</div>
		);
	}
});