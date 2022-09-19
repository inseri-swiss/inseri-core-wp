import { i18n, bulma } from '../utils'

export default () => {
	return (
		<div className={bulma`mr-5`}>
			<div className={bulma`container is-fluid`}>
				<div className={bulma`my-4 is-flex is-align-items-center`}>
					<h1 className={bulma`is-size-4`}>{i18n`Datasources - Inseri`}</h1>
					<button className={bulma`admin-button has-text-weight-bold ml-3`}>
						{i18n`Add New`}
					</button>
				</div>
				<div
					className={bulma`pt-3 my-3 is-flex is-justify-content-space-between`}
				>
					<div>
						<div className={bulma`admin-select`}>
							<select>
								<option>All Types</option>
								<option>With options</option>
							</select>
						</div>
						<div className={bulma`admin-select mx-2`}>
							<select>
								<option>All Methods</option>
								<option>With options</option>
							</select>
						</div>
						<button className={bulma`admin-button has-text-weight-bold`}>
							{i18n`Filter`}
						</button>
					</div>
					<div className={bulma`is-flex`}>
						<input className={bulma`admin-input mx-2`} type="text" />
						<button className={bulma`admin-button has-text-weight-bold`}>
							{i18n`Search`}
						</button>
					</div>
				</div>
				<table
					className={bulma`table is-fullwidth is-striped is-bordered is-size-6`}
				>
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
