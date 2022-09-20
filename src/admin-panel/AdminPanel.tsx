import { i18n } from '../utils'

export default () => {
	return (
		<div className="ba-mr-5">
			<div className="ba-container ba-is-fluid">
				<div className="ba-my-4 ba-is-flex ba-is-align-items-center">
					<h1 className="ba-is-size-4">{i18n`Datasources - Inseri`}</h1>
					<button className="ba-admin-button ba-has-text-weight-bold ba-ml-3">{i18n`Add New`}</button>
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
						<button className="ba-admin-button ba-has-text-weight-bold">{i18n`Filter`}</button>
					</div>
					<div className="ba-is-flex">
						<input className="ba-admin-input ba-mx-2" type="text" />
						<button className="ba-admin-button ba-has-text-weight-bold">{i18n`Search`}</button>
					</div>
				</div>
				<table className="ba-table ba-is-fullwidth ba-is-striped ba-is-bordered ba-is-size-6">
					<thead>
						<tr>
							<th>{i18n`Name`}</th>
							<th>{i18n`Type`}</th>
							<th>{i18n`Method`}</th>
							<th>{i18n`Author`}</th>
							<th>{i18n`URL`}</th>
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
