/* eslint-env mocha */
const commandHandler = require('../src/Classes/CommandHandler');
const baseCommand = require('../src/Classes/BaseCommand.js');

const expect = require('chai').expect;

const handler = new commandHandler(undefined);

const permissions = {
  'TestingGuildName': {
    'channels': [],
    'roles': [],
    'users': []
  }
};

const options = {
  prefix: '!',
  command: 'Test',
  category: 'Testing',
  aliases: ['test1', 'test2'],
  min_args: 0,
  description: 'Testing command for tests',
  syntax: 'testing',
  invokeDM: false,
  enabled: true,
  delInvokeMsg: false,
  ignoreInHelp: true
};

describe('Command Handler' , function() {
  let testingCommand;

  beforeEach(function() {
    permissions['TestingGuildName'].channels = [];
    permissions['TestingGuildName'].roles = [];
    permissions['TestingGuildName'].users = [];

    testingCommand = new baseCommand(permissions, options);
  });

  describe('Cooldowns', function() {
    const channelID = '1';

    beforeEach(function() {
      handler.commandCooldowns = [];
    });

    context('Should add a cooldown', function() {
      it('Adds a cooldown', function() {
        testingCommand.cooldown = 1000;
        handler.addCooldown(testingCommand, channelID);
  
        expect(handler.commandCooldowns).to.have.lengthOf(1);
      });
    });

    context('Should not add a cooldown', function() {
      it('Does not add a cooldown', function() {
        testingCommand.cooldown = 0;
        handler.addCooldown(testingCommand, channelID);
  
        expect(handler.commandCooldowns).to.have.lengthOf(0);
      });
    });

    context('Should not have a cooldown', function() {
      it('Does not have cooldown time remaining', function() {
        testingCommand.cooldown = -1;
        handler.addCooldown(testingCommand, channelID);
  
        const onCooldown = handler.checkCooldown(testingCommand, channelID);
  
        expect(onCooldown).to.be.undefined;
      });
    });

    context('Should have a cooldown', function() {
      it('Should have cooldown time remaining', function() {
        testingCommand.cooldown = 1000;
        handler.addCooldown(testingCommand, channelID);

        const onCooldown = handler.checkCooldown(testingCommand, channelID);

        expect(onCooldown).to.be.greaterThan(0);
      });
    });
  });

  describe('Permissions', function() {
    const mockMsg = {
      channel: {
        id: '1',
        name: '',
        guild: {
          name: 'TestingGuildName',
          roles: new Map(),
          members: new Map()
        }
      },
      author: {
        id: '1'
      }
    };

    beforeEach(function() {
      mockMsg.channel.guild.members = new Map();
      mockMsg.channel.guild.roles = new Map();
      mockMsg.author.id = '1';

      const member = {
        id: '1',
        roles: []
      };

      mockMsg.channel.guild.members.set(member.id, member);      
    });

    context('Guild permissions', function() {
      context('No command permissions required', function() {
        it('Should have permission', function() {
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.true;
        });
      });
  
      context('Command channel permission required', function() {
        it('Should have permission', function() {
          testingCommand.permissions['TestingGuildName'].channels.push('GuildTestingChannel');
          mockMsg.channel.name = 'GuildTestingChannel';
    
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.true;
        });
  
        it('Should not have permission', function() {
          testingCommand.permissions['TestingGuildName'].channels.push('GuildTestingChannel');
          mockMsg.channel.name = 'GuildTestingChannel1';
    
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.false;
        });
      });
  
      context('Command role permission required', function() {
        it('Should have permission', function() {
          testingCommand.permissions['TestingGuildName'].roles.push('GuildTestingRole');
          mockMsg.channel.guild.roles.set('1', {id: 1, name: 'GuildTestingRole'});
          mockMsg.channel.guild.members.get('1').roles.push('1');
    
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.true;
        });
  
        it('Should not have permission', function() {
          testingCommand.permissions['TestingGuildName'].roles.push('GuildTestingRole');
          mockMsg.channel.guild.roles.set('1', {id: 1, name: 'GuildTestingRole'});
    
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.false;
        });
      });
  
      context('Command user permission required', function() {
        it('Should have permission', function() {
          testingCommand.permissions['TestingGuildName'].users.push('1');
  
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.true;
        });
  
        it('Should not have permission', function() {
          testingCommand.permissions['TestingGuildName'].users.push('1');
          mockMsg.author.id = '2';
          mockMsg.channel.guild.members.set(mockMsg.author.id, {id: mockMsg.author.id, roles: []});
  
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.false;
        });
      });
  
      context('Command role and channel permission required', function() {
        it('Should have permission', function() {
          testingCommand.permissions['TestingGuildName'].channels.push('GuildTestingChannel');
          testingCommand.permissions['TestingGuildName'].roles.push('GuildTestingRole');
  
          mockMsg.channel.name = 'GuildTestingChannel';
          mockMsg.channel.guild.roles.set('1', {id: 1, name: 'GuildTestingRole'});
          mockMsg.channel.guild.members.get('1').roles.push('1');
    
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.true;
        });
  
        it('Should not have permission', function() {
          testingCommand.permissions['TestingGuildName'].channels.push('GuildTestingChannel');
          testingCommand.permissions['TestingGuildName'].roles.push('GuildTestingRole');
    
          const hasPermissions = handler.checkPermissions(testingCommand, mockMsg);
          expect(hasPermissions).to.be.false;
        });
      });
    });

    context('DM Permissions', function() {
      context('No command permission required', function() {
        it('Should have permission', function() {
  
          const hasPermissions = handler.checkUsersPermission(testingCommand, mockMsg);
          expect(hasPermissions).to.be.true;
        });
      });
  
      context('Command user permission required', function() {
        it('Should have permission', function() {
  
          const hasPermissions = handler.checkUsersPermission(testingCommand, mockMsg);
          expect(hasPermissions).to.be.true;
        });
    
        it('Should not have permission', function() {
          testingCommand.permissions['TestingGuildName'].users.push('1');
          mockMsg.author.id = '2';
    
          const hasPermissions = handler.checkUsersPermission(testingCommand, mockMsg);
          expect(hasPermissions).to.be.false;
        });
      });
    });
  });
});
