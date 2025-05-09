import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Slide, Chip, IconButton, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Moment from 'react-moment';
import Truncate from '@nosferatu500/react-truncate';

import { GetCloseColorName } from '../../../util/CloseColor';
import Nui from '../../../util/Nui';
import { usePermissions } from '../../../hooks';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		borderLeft: `6px solid ${theme.palette.primary.dark}`,
		padding: 10,
		background: `${theme.palette.secondary.main}c9`,
		marginBottom: 10,
		'&.type-1': {
			borderLeft: `6px solid ${theme.palette.info.dark}`,
			background: `${theme.palette.info.main}c9`,
			'&.panic': {
				'-webkit-animation': 'pd-panic 1s infinite, pd-panic-border 1s infinite',
			},
		},
		'&.type-2': {
			borderLeft: `6px solid #2b0215`,
			background: `#760036c9`,
			'&.panic': {
				'-webkit-animation': 'ems-panic 1s infinite',
			},
		},
		'&.type-3': {
			borderLeft: `6px solid #270d3d`,
			background: `#6818adc9`,
			'&.panic': {
				'-webkit-animation': 'misc-panic 1s infinite, misc-panic-border 1s infinite',
			},
		},
	},
	chip: {
		margin: '0 6px',
		'&.id': {
			backgroundColor: theme.palette.text.main,
			color: theme.palette.secondary.dark,
		},
		'&.code': {
			backgroundColor: theme.palette.warning.main,
		},
	},
	icon: {
		marginRight: 5,
	},
	minor: {
		fontSize: 14,
	},
}));

export default ({ alert }) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const hasPerm = usePermissions();
	const showing = useSelector((state) => state.alerts.showing);

	const [onScreen, setOnScreen] = useState(alert.onScreen);

	//console.log(alert.type, hasPerm('police_alerts'))

	if (
		(alert.type == 1 && !hasPerm('police_alerts')) ||
		(alert.type == 2 && !hasPerm('ems_alerts')) ||
		(alert.type == 3 && !hasPerm('tow_alerts')) || 
		(alert.type == 3 && !hasPerm('doc_alerts'))
	)
		return null;

	useEffect(() => {
		let i = setInterval(() => {
			if (!alert.onScreen) clearInterval(i);
			if (alert.time + 1000 * 10 < Date.now() && onScreen) {
				setOnScreen(false);
			}
		}, 500);
		return () => {
			clearInterval(i);
		};
	}, []);

	const onAnimEnd = () => {
		dispatch({
			type: 'EXPIRE_ALERT',
			payload: alert.id,
		});
	};

	const onRoute = () => {
		Nui.send('RouteAlert', alert);
	};

	const onCamera = () => {
		Nui.send('ViewCamera', alert);
	};

	const getIcon = () => {
		switch (alert.style) {
			case 1:
				return <FontAwesomeIcon icon={['fas', 'siren-on']} />;
			case 2:
				return <FontAwesomeIcon icon={['fas', 'truck-medical']} />;
			case 3:
				return <FontAwesomeIcon icon={['fas', 'truck-ramp']} />;
		}
	};

	const getInner = () => {
		return (
			<div className={`${classes.wrapper} type-${alert.style}${alert.panic ? ' panic' : ''}`}>
				<Grid container>
					<Grid item xs={Boolean(alert.location) || Boolean(alert.camera) ? 11 : 12}>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							{getIcon()}
							<Chip className={`${classes.chip} code`} size="small" label={alert.code} />
							<Truncate lines={1}>{alert.title}</Truncate>
						</div>
						{Boolean(alert.description) && (<>
							<div className={classes.minor}>
								<FontAwesomeIcon
									className={classes.icon}
									icon={[
										'fas',
										Boolean(alert?.description?.icon) ? alert?.description?.icon : 'question',
									]}
								/>
								<b>{alert.description.details}</b>
							</div>
							{Boolean(alert.description.vehicleColor) && <div className={classes.minor}>
								<Grid container direction="row">
									<Grid item xs={5}>
										<FontAwesomeIcon
											className={classes.icon}
											style={{
												color: `rgb(${alert.description.vehicleColor.r}, ${alert.description.vehicleColor.g}, ${alert.description.vehicleColor.b})`
											}}
											icon={['fas', 'palette']}
										/>
										<b>{GetCloseColorName(alert.description.vehicleColor.r, alert.description.vehicleColor.g, alert.description.vehicleColor.b)}</b>
									</Grid>
									{Boolean(alert.description.vehiclePlate) && <Grid item xs={4}>
										<FontAwesomeIcon
											className={classes.icon}
											icon={['fas', 'closed-captioning']}
										/>
										<b>{alert.description.vehiclePlate}</b>
									</Grid>}
									{Boolean(alert.description.vehicleClass) && <Grid item xs={3}>
										<FontAwesomeIcon
											className={classes.icon}
											icon={['fas', 'circle-info']}
										/>
										Class: <b>{alert.description.vehicleClass}</b>
									</Grid>}
								</Grid>
							</div>}
						</>)}
						{Boolean(alert.location) ? (
							<div className={classes.minor}>
								<FontAwesomeIcon className={classes.icon} icon={['fas', 'location']} />
								{alert.location.street1} {alert.location.street2 && `/ ${alert.location.street2} `}|{' '}
								{alert.location.area}
							</div>
						) : (
							<div className={classes.minor}>
								<FontAwesomeIcon className={classes.icon} icon={['fas', 'location']} />
								Unknown Location
							</div>
						)}
						<div className={classes.minor}>
							<FontAwesomeIcon className={classes.icon} icon={['fas', 'stopwatch']} />
							<Moment date={alert.time} fromNow />
						</div>
					</Grid>
					{(Boolean(alert.location) || Boolean(alert.camera)) && (
						<Grid item xs={1} style={{ textAlign: 'right' }}>
							{Boolean(alert.location) && (
								<IconButton onClick={onRoute}>
									<FontAwesomeIcon icon={['fas', 'location-question']} />
								</IconButton>
							)}
							{Boolean(alert.camera) && (
								<IconButton onClick={onCamera}>
									<FontAwesomeIcon icon={['fas', 'camera-cctv']} />
								</IconButton>
							)}
						</Grid>
					)}
				</Grid>
			</div>
		);
	};

	if (showing) {
		return <div>{getInner()}</div>;
	} else {
		return (
			<Slide in={onScreen} direction="left" onExited={onAnimEnd}>
				{getInner()}
			</Slide>
		);
	}
};
