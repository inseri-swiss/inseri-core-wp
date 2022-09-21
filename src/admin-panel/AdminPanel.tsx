import { __ } from '@wordpress/i18n'

export default () => {
	return (
		<div className="ba-mr-5">
			<div className="ba-container ba-is-fluid">
				<div className="ba-my-4 ba-is-flex ba-is-align-items-center">
					<h1 className="ba-is-size-4">{__('Datasources - Inseri', 'inseri-core')}</h1>
					<button className="ba-admin-button ba-has-text-weight-bold ba-ml-3">{__('Add New', 'inseri-core')}</button>
				</div>
				<div className="ba-pt-3 ba-my-3 ba-is-flex ba-is-justify-content-space-between">
					<div>
						<div className="ba-admin-select">
							<select>
								<option>All Types</option>
								<option>With options</option>
							</select>
						</div>
						<div className="ba-admin-select mx-2">
							<select>
								<option>All Methods</option>
								<option>With options</option>
							</select>
						</div>
						<button className="ba-admin-button ba-has-text-weight-bold">{__('Filter', 'inseri-core')}</button>
					</div>
					<div className="ba-is-flex">
						<input className="ba-admin-input ba-mx-2" type="text" />
						<button className="ba-admin-button ba-has-text-weight-bold">{__('Search', 'inseri-core')}</button>
					</div>
				</div>
				<table className="ba-table ba-is-fullwidth ba-is-striped ba-is-bordered ba-is-size-6">
					<thead>
						<tr>
							<th>{__('Name', 'inseri-core')}</th>
							<th>{__('Type', 'inseri-core')}</th>
							<th>{__('Method', 'inseri-core')}</th>
							<th>{__('Author', 'inseri-core')}</th>
							<th>{__('URL', 'inseri-core')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Foo</td>
							<td>REST-API</td>
							<td>PUT</td>
							<td>admin</td>
							<td>http://www.inseri.swiss</td>
						</tr>
						<tr>
							<td>Foo</td>
							<td>REST-API</td>
							<td>PUT</td>
							<td>admin</td>
							<td>http://www.inseri.swiss</td>
						</tr>
						<tr>
							<td>Foo</td>
							<td>REST-API</td>
							<td>PUT</td>
							<td>admin</td>
							<td>http://www.inseri.swiss</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}
