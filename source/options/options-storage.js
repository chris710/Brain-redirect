import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
	defaults: {
		blacklist: "facebook.com\ntwitter.com\nyoutube.com\nreddit.com",
		challenge: "clozemaster.com",
		trigger: "clozemaster.com/assets/success",
		embedded: false,
	},
	migrations: [
		OptionsSync.migrations.removeUnused
	],
	logging: true
});

